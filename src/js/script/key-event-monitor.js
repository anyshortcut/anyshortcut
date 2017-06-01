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
    chrome.runtime.sendMessage({request: true, key: keyCodeChar}, shortcut => {
        if (shortcut) {
            helper.openShortcut(shortcut);
        } else {
            modal.showPrimaryShortcutUnbound(keyCodeChar);
        }
    });
    cleanUp();
}


function triggerSecondaryShortcut(keyCodeChar) {
    chrome.runtime.sendMessage({
        secondaryRequest: true,
        hostname: location.hostname,
        key: keyCodeChar,
    }, shortcut => {
        if (shortcut) {
            helper.openShortcut(shortcut);
        } else {
            modal.showSecondaryShortcutUnbound(keyCodeChar)
        }
    });
    cleanUp();
}


function triggerQueryShortcut(firstKeyCodeChar, secondKeyCodeChar) {
    chrome.runtime.sendMessage({
        query: true, firstKey: firstKeyCodeChar, secondKey: secondKeyCodeChar
    }, response => {
        let primaryShortcut = response.primaryShortcut;
        let secondaryShortcut = response.secondaryShortcut;

        if (primaryShortcut && secondaryShortcut) {
            // Primary and secondary shortcut both exist,
            // show a chooser let user choose one.
            modal.showQueryShortcutChooser(primaryShortcut, secondaryShortcut);
        } else if (primaryShortcut) {
            helper.openShortcut(primaryShortcut);
        } else if (secondaryShortcut) {
            helper.openShortcut(secondaryShortcut);
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
        if (helper.isValidOptionModifier(firstKey)) {
            triggerSecondaryShortcut(firstKey.keyCodeChar);
        } else if (helper.isValidFullModifier(firstKey)) {
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

function monitorKeyUp(e) {
    e = helper.ensureWindowEvent(e);
    if (!helper.isValidModifierKey(e)) {
        // Ignore invalid modifier key
        return;
    }

    if (helper.isValidKeyCode(e.keyCode)) {
        if (!firstKey.releasedAt) {
            firstKey.releasedAt = Date.now();
        } else if (!secondKey.releasedAt) {
            secondKey.releasedAt = Date.now();
        }

        triggerShortcut()
    } else {
        // left key and right key is 37 and 39
        if (helper.isValidFullModifier(e)) {
            if ([37, 39].indexOf(e.keyCode) > -1) {
                let numberOfEntries = window.history.length - 1;
                //Step value is -1 if the left key,otherwise +1 if right key.
                let step = e.keyCode - 38;

                for (let i = 0; i < numberOfEntries; i++) {
                    window.history.go(step);
                }
            } else if (e.keyCode === 188) { // 'Comma' key code is 188.
                modal.showShortcutKeyboard();
            }

        }
    }
}

function monitorKeyDown(e) {
    e = helper.ensureWindowEvent(e);
    if (!helper.isValidModifierKey(e)) {
        // Ignore invalid modifier key
        return;
    }

    let keyCode = e.keyCode;
    if (!helper.isValidKeyCode(keyCode)) {
        // Ignore invalid key code.
        return;
    }

    // Prevent repeat trigger down event.
    if (firstKey && firstKey.keyCode === keyCode && !firstKey.releasedAt) {
        return;
    }

    let pressedKey = {
        keyCode: keyCode,
        keyCodeChar: String.fromCharCode(keyCode),
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        pressedAt: Date.now(),
        releasedAt: null,
    };

    if (!firstKey.pressedAt) {
        firstKey = pressedKey;
    } else if (!secondKey.pressedAt) {
        secondKey = pressedKey;
    }
}

function cleanUp() {
    firstKey = EMPTY_KEY;
    secondKey = EMPTY_KEY;
    triggerTimeoutId = null;
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log('on message in tab: authenticated=' + message.authenticated);
    if (message.authenticated) {
        document.addEventListener('keyup', monitorKeyUp, false);
        document.addEventListener('keydown', monitorKeyDown, false);
    } else {
        document.removeEventListener('keyup', monitorKeyUp, false);
        document.removeEventListener('keydown', monitorKeyDown, false);
    }
});
