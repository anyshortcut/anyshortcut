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

function triggerPrimaryShortcut(keyCodeChar) {
    chrome.runtime.sendMessage({
        request: true,
        key: keyCodeChar
    }, response => {
        if (response.expired) {
            modal.showSubscriptionExpired();
            return;
        }

        if (response.shortcut) {
            helper.openShortcut(response.shortcut, response.byBlank);
        } else {
            modal.showPrimaryShortcutUnbound(keyCodeChar);
        }
    });
    cleanUp();
}


function triggerQueryShortcut(firstKeyCodeChar, secondKeyCodeChar) {
    chrome.runtime.sendMessage({
        query: true, firstKey: firstKeyCodeChar, secondKey: secondKeyCodeChar
    }, response => {
        if (response.expired) {
            modal.showSubscriptionExpired();
            return;
        }

        let primaryShortcut = response.primaryShortcut;
        let secondaryShortcut = response.secondaryShortcut;

        if (primaryShortcut && secondaryShortcut) {
            // Primary and secondary shortcut both exist,
            // show a chooser let user choose one.
            modal.showQueryShortcutChooser(primaryShortcut, secondaryShortcut, response.byBlank);
        } else if (primaryShortcut) {
            helper.openShortcut(primaryShortcut, response.byBlank);
        } else if (secondaryShortcut) {
            helper.openShortcut(secondaryShortcut, response.byBlank);
        } else {
            // Neither shortcut bound.
            modal.showQueryShortcutFailed(firstKeyCodeChar, secondKeyCodeChar);
        }
    });
    cleanUp();
}

/**
 * Trigger shortcut.
 */
function triggerShortcut() {
    if (triggerTimeoutId) {
        // Clear previous session timeout if existed
        window.clearTimeout(triggerTimeoutId);
        triggerTimeoutId = null;
    }

    if (firstKey.pressedAt && firstKey.releasedAt) {
        if (helper.withAltModifier(firstKey)) {
            if (secondKey.pressedAt && secondKey.releasedAt) {
                triggerQueryShortcut(firstKey.keyCodeChar, secondKey.keyCodeChar);
            } else {
                triggerTimeoutId = window.setTimeout(function() {
                    triggerPrimaryShortcut(firstKey.keyCodeChar);
                }, helper.delayTime);
            }
        }
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

        triggerShortcut();
    },
    onKeyDown(event) {
        event = helper.ensureWindowEvent(event);
        if (!helper.isValidKeyEvent(event)) {
            // Ignore invalid key event
            return;
        }

        // Prevent repeat trigger down event.
        if (event.repeat) {
            return;
        }

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