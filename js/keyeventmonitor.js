function monitorKeyUp(e) {
    e = keyCodeHelper.ensureWindowEvent(e);
    if (isValidFullModifier(e)) {
        if (keyCodeHelper.isValidKeyCode(e.keyCode)) {
            var message = {};
            //A flag to tell background.js the message is from Content Script.
            message.request = true;
            var keyCodeChar = String.fromCharCode(e.keyCode);
            message.key = keyCodeChar;

            chrome.runtime.sendMessage(message, url => {
                if (url) {
                    console.log(keyCodeChar, url);
                    window.open(url);
                } else {
                    //Inject key code char to current web page for injected javascripts to
                    // obtain current unbound shortcut key.
                    var p = document.getElementById('key-code-char');
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
            var numberOfEntries = window.history.length - 1;
            //Step value is -1 if the left key,otherwise +1 if right key.
            var step = e.keyCode - 38;

            for (var i = 0; i < numberOfEntries; i++) {
                window.history.go(step);
            }
        }
    } else if (isValidOptionModifier(e)) {
        var message = {};
        message.option = true;
        message.location = location;
        chrome.runtime.sendMessage(message, url => {
            if (url) {
                window.open(url);
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
    return e && e.altKey;
}

document.addEventListener('keyup', monitorKeyUp, false);
