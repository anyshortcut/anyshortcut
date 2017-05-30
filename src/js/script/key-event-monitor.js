import keyCodeHelper from '../keycode.js';
import modal from './modal.js';

const EMPTY_KEY = {
    keyCode: 0,
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


function triggerPrimaryShortcut(keyCode) {
    let keyCodeChar = String.fromCharCode(keyCode);
    chrome.runtime.sendMessage({request: true, key: keyCodeChar}, response => {
        if (response) {
            let url = response.url;
            if (response.byBlank) {
                window.open(url);
            } else {
                location.href = url;
            }
        } else {
            modal.showPrimaryShortcutUnbound(keyCodeChar);
        }
    });
    cleanUp();
}


function triggerSecondaryShortcut(keyCode) {
    chrome.runtime.sendMessage({
        secondaryRequest: true,
        location: location,
        key: String.fromCharCode(keyCode).toUpperCase()// Convert the key to uppercase.
    }, response => {
        if (response) {
            let url = response.url;
            if (response.byBlank) {
                window.open(url);
            } else {
                location.href = url;
            }
        } else {
            modal.showSecondaryShortcutUnbound(String.fromCharCode(keyCode))
        }
    });
    cleanUp();
}


function triggerQuickSecondaryShortcut(primaryKeyCode, secondaryKeyCode) {
    chrome.runtime.sendMessage({
        quickSecondaryRequest: true,
        primaryKey: String.fromCharCode(primaryKeyCode),
        secondaryKey: String.fromCharCode(secondaryKeyCode),
    }, response => {
        if (response) {
            let url = response.url;
            if (response.byBlank) {
                window.open(url);
            } else {
                location.href = url;
            }
        } else {
            modal.showQuickSecondaryShortcutFailed(String.fromCharCode(primaryKeyCode),
                String.fromCharCode(secondaryKeyCode))
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

    console.log('first key:', firstKey, ' second key:', secondKey);

    if (firstKey.pressedAt && firstKey.releasedAt) {
        if (isValidOptionModifier(firstKey)) {
            triggerSecondaryShortcut(firstKey.keyCode);
        } else if (isValidFullModifier(firstKey)) {
            if (secondKey.pressedAt && secondKey.releasedAt) {
                triggerQuickSecondaryShortcut(firstKey.keyCode, secondKey.keyCode);
            } else {
                triggerTimeoutId = window.setTimeout(function() {
                    triggerPrimaryShortcut(firstKey.keyCode);
                }, 382);
            }
        }
    }
}

function monitorKeyUp(e) {
    e = keyCodeHelper.ensureWindowEvent(e);

    if (keyCodeHelper.isValidKeyCode(e.keyCode)) {
        if (!firstKey.releasedAt) {
            firstKey.releasedAt = Date.now();
        } else if (!secondKey.releasedAt) {
            secondKey.releasedAt = Date.now();
        }

        triggerShortcut()
    } else {
        // left key and right key is 37 and 39
        if (isValidFullModifier(e)) {
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
    e = keyCodeHelper.ensureWindowEvent(e);
    if (!isValidModifierKey(e)) {
        // Ignore invalid modifier key
        return;
    }

    let keyCode = e.keyCode;
    if (!keyCodeHelper.isValidKeyCode(keyCode)) {
        // Ignore invalid key code.
        return;
    }

    // Prevent repeat trigger down event.
    if (firstKey && firstKey.keyCode === keyCode && !firstKey.releasedAt) {
        return;
    }

    if (!firstKey.pressedAt) {
        firstKey = {
            keyCode: keyCode,
            shiftKey: e.shiftKey,
            altKey: e.altKey,
            ctrlKey: e.ctrlKey,
            metaKey: e.metaKey,
            pressedAt: Date.now(),
            releasedAt: null,
        };
    } else if (!secondKey.pressedAt) {
        secondKey = {
            keyCode: keyCode,
            shiftKey: e.shiftKey,
            altKey: e.altKey,
            ctrlKey: e.ctrlKey,
            metaKey: e.metaKey,
            pressedAt: Date.now(),
            releasedAt: null,
        };
    }
}

function cleanUp() {
    firstKey = EMPTY_KEY;
    secondKey = EMPTY_KEY;
    triggerTimeoutId = null;
}

function isValidModifierKey(e) {
    return isValidFullModifier(e) || isValidOptionModifier(e);
}
/*
 * Check the event key modifier is full valid or not.
 */
function isValidFullModifier(e) {
    return e && e.shiftKey && e.altKey && !e.ctrlKey && !e.metaKey;
}

function isValidOptionModifier(e) {
    return e && e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey;
}

document.addEventListener('keyup', monitorKeyUp, false);
document.addEventListener('keydown', monitorKeyDown, false);
