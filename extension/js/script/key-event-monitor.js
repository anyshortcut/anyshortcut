import keyCodeHelper from '../keycode.js';

const EMPTY_KEY = {
    keyCode: 0,
    target: null,
    alt: false,
    shift: false,
    pressedAt: null,
    releasedAt: null,
};

let pressedKeyNumber = 0;
let releasedKeyNumber = 0;
let firstKey = EMPTY_KEY;
let secondKey = EMPTY_KEY;


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
            injectKeyCodeChar(keyCodeChar)
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
            injectKeyCodeChar(String.fromCharCode(keyCode));
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
            injectKeyCodeChar(String.fromCharCode(primaryKeyCode)
                +'→'+ String.fromCharCode(secondaryKeyCode));
        }
    });
    cleanUp();
}

/**
 * Trigger shortcut.
 */
function triggerShortcut() {
    if (firstKey.pressedAt && firstKey.releasedAt) {
        if (isValidOptionModifier(firstKey.target)) {
            triggerSecondaryShortcut(firstKey.keyCode);
        } else if (isValidFullModifier(firstKey.target)) {
            if (secondKey.releasedAt && secondKey.releasedAt) {
                triggerQuickSecondaryShortcut(firstKey.keyCode, secondKey.keyCode);
            } else {
                if (firstKey.releasedAt - firstKey.pressedAt > 1000) {
                    triggerQuickSecondaryShortcut(firstKey.keyCode, firstKey.keyCode);
                } else {
                    triggerPrimaryShortcut(firstKey.keyCode);
                }
            }
        }
    }
}

function monitorKeyUp(e) {
    e = keyCodeHelper.ensureWindowEvent(e);

    if (keyCodeHelper.isValidKeyCode(e.keyCode)) {
        fireKeyUp(e);
    } else {
        // left key and right key is 37 and 39
        if (isValidFullModifier(e)
            && [37, 39].indexOf(e.keyCode) > -1) {
            let numberOfEntries = window.history.length - 1;
            //Step value is -1 if the left key,otherwise +1 if right key.
            let step = e.keyCode - 38;

            for (let i = 0; i < numberOfEntries; i++) {
                window.history.go(step);
            }
        }
    }
}

function monitorKeyDown(e) {
    e = keyCodeHelper.ensureWindowEvent(e);
    let keyCode = e.keyCode;

    if (!keyCodeHelper.isValidKeyCode(keyCode)) {
        // Ignore invalid key code.
        return;
    }

    if ((firstKey && firstKey.keyCode === keyCode)
        || (secondKey && secondKey.keyCode === keyCode)) {
        // Prevent repeat trigger down event.
        return;
    }

    if (!firstKey.pressedAt) {
        firstKey = {
            keyCode: keyCode,
            target: e,
            shift: e.shift,
            alt: e.alt,
            pressedAt: Date.now(),
            releasedAt: null,
        };
        pressedKeyNumber++;
    } else if (!secondKey.pressedAt) {
        secondKey = {
            keyCode: keyCode,
            target: e,
            shift: e.shift,
            alt: e.alt,
            pressedAt: Date.now(),
            releasedAt: null,
        };
        pressedKeyNumber++;
    }
}

function fireKeyUp(e) {
    let keyCode = e.keyCode;
    if (firstKey.keyCode === keyCode) {
        firstKey.releasedAt = Date.now();
        releasedKeyNumber++;
    } else if (secondKey.keyCode === keyCode) {
        secondKey.releasedAt = Date.now();
        releasedKeyNumber++;
    }

    if (pressedKeyNumber === releasedKeyNumber) {
        triggerShortcut()
    }
}

function cleanUp() {
    pressedKeyNumber = 0;
    releasedKeyNumber = 0;
    firstKey = EMPTY_KEY;
    secondKey = EMPTY_KEY;
}


function injectKeyCodeChar(keyCode) {
    //Inject key code char to current web page for injected JavaScript to
    // obtain current unbound shortcut key.
    let p = document.getElementById('key-code-char');
    if (!p) {
        p = document.createElement('p');
        p.id = 'key-code-char';
        p.style.display = 'none';
        document.body.insertAdjacentElement('beforeEnd', p);
    }
    p.textContent = keyCode;
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
