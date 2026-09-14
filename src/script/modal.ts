import helper from './helper';
import utils from './utils';
import type { Shortcut } from '../types';

let timeoutId: number | undefined = undefined;
// A global flag indicates whether the query chooser is showing,
// to prevent query chooser key conflict with secondary shortcut.
window.isQueryShortcutChooserShowing = false;

function removeElementDelay(element: HTMLElement | null, delay?: number): void {
  timeoutId = window.setTimeout(() => {
    if (element) {
      element.remove();
    }
    timeoutId = undefined;
    window.isQueryShortcutChooserShowing = false;
  }, delay || 2000);
}

/**
 * @param content the message to show in modal, text or html
 */
function openModal(content: string): HTMLElement {
  const div = utils.createDiv('anyshortcut-modal-content');
  div.innerHTML = content;

  const modal = buildModal(div);
  window.top!.document.body.insertAdjacentElement('beforebegin', modal);

  const closeButton = window.top!.document.getElementById('anyshortcut-modal-close');
  if (closeButton) {
    closeButton.onclick = function () {
      window.clearTimeout(timeoutId);
      timeoutId = undefined;
      removeElementDelay(modal, 50);
    };
  }
  modal.focus();
  return modal;
}

function buildModal(content: HTMLElement): HTMLElement {
  const modal = utils.createDiv('anyshortcut-modal');
  modal.tabIndex = 0;

  const container = utils.createDiv('anyshortcut-modal-container');

  removeElementDelay(modal);
  container.onmouseover = function () {
    window.clearTimeout(timeoutId);
    timeoutId = undefined;
  };
  container.onmouseout = function () {
    removeElementDelay(modal);
  };
  modal.addEventListener('keyup', function (e) {
    if (e.keyCode === 27) {
      window.clearTimeout(timeoutId);
      timeoutId = undefined;
      removeElementDelay(modal, 50);
    }
  });

  const header = utils.createDiv('anyshortcut-modal-header');
  header.innerHTML = utils.compile('modal-header', {
    logo: chrome.runtime.getURL('icon/logo.svg'),
  });
  container.appendChild(header);
  container.appendChild(content);

  modal.appendChild(container);
  return modal;
}

export default {
  showAuthenticatedRequired(): void {
    openModal(utils.compile('authenticate-required'));
  },
  showWrongCombinationKey(wrongKey: string): void {
    openModal(
      utils.compile('wrong-combination-key', {
        combinationKey: wrongKey === 'alt' ? 'SHIFT' : 'ALT',
        wrongCombinationKey: wrongKey.toUpperCase(),
      })
    );
  },
  showPrimaryShortcutBindSuccess(combinationKey: string, shortcut: Shortcut): void {
    openModal(
      utils.compile('primary-bind-success', {
        combinationKey: combinationKey.toUpperCase(),
        key: shortcut.key,
      })
    );
  },
  showSecondaryShortcutBindSuccess(
    combinationKey: string,
    shortcut: Shortcut,
    primaryShortcut: Shortcut
  ): void {
    // Only show secondary shortcut bind modal for one key primary shortcut.
    if (primaryShortcut.key.length === 1) {
      openModal(
        utils.compile('secondary-bind-success', {
          combinationKey: combinationKey.toUpperCase(),
          key: shortcut.key,
          primaryShortcut: primaryShortcut,
        })
      );
    }
  },
  showPrimaryShortcutUnbound(combinationKey: string, pressedKey: string): void {
    openModal(
      utils.compile('shortcut-not-found', {
        shortcutType: 'primary',
        combinationKey: combinationKey.toUpperCase(),
        key: pressedKey,
      })
    );
  },
  showQueryShortcutFailed(combinationKey: string, firstKey: string, secondKey: string): void {
    openModal(
      utils.compile('query-shortcut-failed', {
        combinationKey: combinationKey.toUpperCase(),
        firstKey: firstKey,
        secondKey: secondKey,
      })
    );
  },
  showQueryShortcutChooser(primaryShortcut: Shortcut, secondaryShortcut: Shortcut): void {
    const modal = openModal(
      utils.compile('query-shortcut-chooser', {
        shortcuts: [primaryShortcut, secondaryShortcut],
      })
    );

    const chooserEventListener = function (e: KeyboardEvent) {
      if (helper.isValidKeyCode(e.keyCode) && helper.withoutAnyModifier(e)) {
        const keyCodeChar = String.fromCharCode(e.keyCode);
        let shortcut: Shortcut | null = null;
        if (keyCodeChar === '1') {
          shortcut = primaryShortcut;
        } else if (keyCodeChar === '2') {
          shortcut = secondaryShortcut;
        }

        if (shortcut) {
          removeElementDelay(modal, 50);
          modal.removeEventListener('keyup', chooserEventListener);
          chrome.runtime.sendMessage({
            open: true,
            url: shortcut.url,
            shortcutId: shortcut.id,
          });
        }
      }
    };
    modal.addEventListener('keyup', chooserEventListener);
    window.isQueryShortcutChooserShowing = true;
  },
  showSubscriptionExpired(): void {
    openModal(utils.compile('subscription-expired'));
  },
};
