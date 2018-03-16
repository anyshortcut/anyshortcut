import helper from './helper.js';
import modal from './modal.js';

const EMPTY_KEY = {
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
let triggerTimeoutId = null;

function triggerPrimaryShortcut(modifier, keyCodeChar) {
    chrome.runtime.sendMessage({
        request: true,
        modifier: modifier,
        key: keyCodeChar
    }, response => {
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
                modal.showPrimaryShortcutUnbound(modifier, keyCodeChar);
            }
        }
    });
    cleanUp();
}


function triggerQueryShortcut(modifier, firstKeyCodeChar, secondKeyCodeChar) {
    chrome.runtime.sendMessage({
        query: true,
        modifier: modifier,
        firstKey: firstKeyCodeChar,
        secondKey: secondKeyCodeChar
    }, response => {
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

            let primaryShortcut = response.primaryShortcut;
            let secondaryShortcut = response.secondaryShortcut;

            if (primaryShortcut && secondaryShortcut) {
                // Primary and secondary shortcut both exist,
                // show a chooser let user choose one.
                modal.showQueryShortcutChooser(primaryShortcut, secondaryShortcut);
            } else if (!primaryShortcut && !secondaryShortcut) {
                // Neither shortcut bound.
                modal.showQueryShortcutFailed(modifier, firstKeyCodeChar, secondKeyCodeChar);
            }
        }
    });
    cleanUp();
}

/**
 * Trigger shortcut.
 */
function triggerShortcut(event) {
    // Clear trigger timeout here to fix this bug:
    // ALT + G + I show ALT + G + I, then show ALT + null
    clearTriggerTimeout();

    let modifier = helper.getEventModifier(event);
    if (modifier && firstKey.pressedAt && firstKey.releasedAt) {
        if (secondKey.pressedAt && secondKey.releasedAt) {
            triggerQueryShortcut(modifier, firstKey.keyCodeChar, secondKey.keyCodeChar);
        } else {
            // Don't delay if there are no secondary shortcuts
            triggerTimeoutId = window.setTimeout(function() {
                triggerPrimaryShortcut(modifier, firstKey.keyCodeChar);
            }, window.delay ? helper.delayTime : 0);
        }
    } else {
        cleanUp();
    }
}

function clearTriggerTimeout() {
    if (triggerTimeoutId) {
        // Clear previous session timeout if existed
        window.clearTimeout(triggerTimeoutId);
        triggerTimeoutId = null;
    }
}

function cleanUp() {
    firstKey = EMPTY_KEY;
    secondKey = EMPTY_KEY;
    triggerTimeoutId = null;
}

export default {
    onKeyUp(event) {
        event = helper.ensureWindowEvent(event);
        if (!helper.isValidKeyEvent(event)) {
            // Ignore invalid key event
            return;
        }

        if (!firstKey.releasedAt) {
            firstKey.releasedAt = Date.now();
        } else if (!secondKey.releasedAt) {
            secondKey.releasedAt = Date.now();
        }

        triggerShortcut(event);
    },
    onKeyDown(event) {
        event = helper.ensureWindowEvent(event);
        if (!helper.isValidKeyEvent(event)) {
            // Ignore invalid key event
            cleanUp();
            return;
        }

        // Prevent repeat trigger down event.
        if (event.repeat) {
            return;
        }

        // Clear trigger timeout here to reduce two keys shortcut and primary shortcut trigger delay time
        clearTriggerTimeout();

        let keyCode = event.keyCode;
        let pressedKey = {
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
    }
}