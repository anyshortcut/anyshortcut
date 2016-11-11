import keyCodeHelper from '../keycode.js';

function monitorKeyUp(e) {
    e = keyCodeHelper.ensureWindowEvent(e);
    if (isValidFullModifier(e)) {
        if (keyCodeHelper.isValidKeyCode(e.keyCode)) {
            let keyCodeChar = String.fromCharCode(e.keyCode);
            chrome.runtime.sendMessage({request: true, key: keyCodeChar}, url => {
                if (url) {
                    window.open(url);
                } else {
                    //Inject key code char to current web page for injected javascripts to
                    // obtain current unbound shortcut key.
                    let p = document.getElementById('key-code-char');
                    if (!p) {
                        p = document.createElement('p');
                        p.id = 'key-code-char';
                        p.style.display = 'none';
                        document.body.insertAdjacentElement('beforeEnd', p);
                    }
                    p.textContent = keyCodeChar;
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
    } else if (isValidOptionModifier(e)) {
        chrome.runtime.sendMessage({
            optionRequest: true,
            location: location,
            key: String.fromCharCode(e.keyCode).toUpperCase()// Convert the key to uppercase.
        }, url => {
            if (url) {
                //window.open(url);
                location.href = url;
            }
        });
    }
}

/*
 * Check the event key modifier is full valid or not.
 */
function isValidFullModifier(e) {
    return e && e.shiftKey && e.altKey;
}

function isValidOptionModifier(e) {
    return e && e.altKey && !e.shiftKey;
}

document.addEventListener('keyup', monitorKeyUp, false);
