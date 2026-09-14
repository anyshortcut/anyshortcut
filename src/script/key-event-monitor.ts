import helper from './helper';
import modal from './modal';
import type { Shortcut } from '../types';

interface PressedKey {
  keyCode: number;
  keyCodeChar: string | null;
  altKey: boolean;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  pressedAt: number | null;
  releasedAt: number | null;
}

interface TriggerResponse {
  authenticateRequired?: boolean;
  wrongModifier?: boolean;
  expired?: boolean;
  shortcut?: Shortcut | null;
  primaryShortcut?: Shortcut | null;
  secondaryShortcut?: Shortcut | null;
}

const EMPTY_KEY: PressedKey = {
  keyCode: 0,
  keyCodeChar: null,
  altKey: false,
  shiftKey: false,
  ctrlKey: false,
  metaKey: false,
  pressedAt: null,
  releasedAt: null,
};

let firstKey = EMPTY_KEY;
let secondKey = EMPTY_KEY;
let triggerTimeoutId: number | null = null;

function triggerPrimaryShortcut(modifier: string, keyCodeChar: string | null): void {
  chrome.runtime.sendMessage(
    {
      request: true,
      modifier: modifier,
      key: keyCodeChar,
    },
    (response: TriggerResponse | undefined) => {
      if (response) {
        if (response.authenticateRequired) {
          modal.showAuthenticatedRequired();
          return;
        }

        // User trigger a wrong modifier key.
        if (response.wrongModifier) {
          modal.showWrongCombinationKey(modifier);
          return;
        }

        if (response.expired) {
          modal.showSubscriptionExpired();
          return;
        }

        if (!response.shortcut) {
          modal.showPrimaryShortcutUnbound(modifier, keyCodeChar!);
        }
      }
    }
  );
  cleanUp();
}

function triggerQueryShortcut(
  modifier: string,
  firstKeyCodeChar: string | null,
  secondKeyCodeChar: string | null
): void {
  chrome.runtime.sendMessage(
    {
      query: true,
      modifier: modifier,
      firstKey: firstKeyCodeChar,
      secondKey: secondKeyCodeChar,
    },
    (response: TriggerResponse | undefined) => {
      if (response) {
        if (response.authenticateRequired) {
          modal.showAuthenticatedRequired();
          return;
        }

        // User trigger a wrong modifier key.
        if (response.wrongModifier) {
          modal.showWrongCombinationKey(modifier);
          return;
        }

        if (response.expired) {
          modal.showSubscriptionExpired();
          return;
        }

        const primaryShortcut = response.primaryShortcut;
        const secondaryShortcut = response.secondaryShortcut;

        if (primaryShortcut && secondaryShortcut) {
          // Primary and secondary shortcut both exist,
          // show a chooser let user choose one.
          modal.showQueryShortcutChooser(primaryShortcut, secondaryShortcut);
        } else if (!primaryShortcut && !secondaryShortcut) {
          // Neither shortcut bound.
          modal.showQueryShortcutFailed(modifier, firstKeyCodeChar!, secondKeyCodeChar!);
        }
      }
    }
  );
  cleanUp();
}

/**
 * Trigger shortcut.
 */
function triggerShortcut(event: KeyboardEvent): void {
  // Clear trigger timeout here to fix this bug:
  // ALT + G + I show ALT + G + I, then show ALT + null
  clearTriggerTimeout();

  const modifier = helper.getEventModifier(event);
  if (modifier && firstKey.pressedAt && firstKey.releasedAt) {
    if (secondKey.pressedAt && secondKey.releasedAt) {
      triggerQueryShortcut(modifier, firstKey.keyCodeChar, secondKey.keyCodeChar);
    } else {
      // Don't delay if there are no secondary shortcuts
      triggerTimeoutId = window.setTimeout(
        function () {
          triggerPrimaryShortcut(modifier, firstKey.keyCodeChar);
        },
        window.delay ? helper.delayTime : 0
      );
    }
  } else {
    cleanUp();
  }
}

function clearTriggerTimeout(): void {
  if (triggerTimeoutId) {
    // Clear previous session timeout if existed
    window.clearTimeout(triggerTimeoutId);
    triggerTimeoutId = null;
  }
}

function cleanUp(): void {
  firstKey = EMPTY_KEY;
  secondKey = EMPTY_KEY;
  triggerTimeoutId = null;
}

export default {
  onKeyUp(event: KeyboardEvent): void {
    event = helper.ensureWindowEvent(event);
    if (!helper.isValidKeyEvent(event)) {
      // Ignore invalid key event
      return;
    }

    event.preventDefault();

    if (!firstKey.releasedAt) {
      firstKey.releasedAt = Date.now();
    } else if (!secondKey.releasedAt) {
      secondKey.releasedAt = Date.now();
    }

    triggerShortcut(event);
  },
  onKeyDown(event: KeyboardEvent): void {
    event = helper.ensureWindowEvent(event);
    if (!helper.isValidKeyEvent(event)) {
      // Ignore invalid key event
      cleanUp();
      return;
    }

    event.preventDefault();

    // Prevent repeat trigger down event.
    if (event.repeat) {
      return;
    }

    // Clear trigger timeout here to reduce two keys shortcut and primary shortcut trigger delay time
    clearTriggerTimeout();

    const keyCode = event.keyCode;
    const pressedKey: PressedKey = {
      keyCode: keyCode,
      keyCodeChar: String.fromCharCode(keyCode),
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      pressedAt: Date.now(),
      releasedAt: null,
    };

    if (!firstKey.pressedAt) {
      firstKey = pressedKey;
    } else if (!secondKey.pressedAt) {
      secondKey = pressedKey;
    }
  },
};
