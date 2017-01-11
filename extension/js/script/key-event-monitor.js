import keyCodeHelper from '../keycode.js';

function monitorKeyUp(e) {
    e = keyCodeHelper.ensureWindowEvent(e);
    if (isValidFullModifier(e)) {
        if (keyCodeHelper.isValidKeyCode(e.keyCode)) {
            let keyCodeChar = String.fromCharCode(e.keyCode);
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
        } else if ([37, 39].indexOf(e.keyCode) > -1) { // left key and right key is 37 and 39
            let numberOfEntries = window.history.length - 1;
            //Step value is -1 if the left key,otherwise +1 if right key.
            let step = e.keyCode - 38;

            for (let i = 0; i < numberOfEntries; i++) {
                window.history.go(step);
            }
        }
    } else if (isValidOptionModifier(e) && keyCodeHelper.isValidKeyCode(e.keyCode)) {
        chrome.runtime.sendMessage({
            secondaryRequest: true,
            location: location,
            key: String.fromCharCode(e.keyCode).toUpperCase()// Convert the key to uppercase.
        }, response => {
            if (response) {
                let url = response.url;
                if (response.byBlank) {
                    window.open(url);
                } else {
                    location.href = url;
                }
            } else {
                injectKeyCodeChar(String.fromCharCode(e.keyCode));
            }
        });
    }
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
