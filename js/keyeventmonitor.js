function monitorKeyUp(e) {
    e = keyCodeHelper.ensureWindowEvent(e);
    if (!isValidModifier(e)) {
        return;
    }

    if (keyCodeHelper.isValidKeyCode(e.keyCode)) {
        const message = {};
        //A flag to tell background.js the message is from Content Script.
        message.request = true;
        const keyCodeChar = String.fromCharCode(e.keyCode);
        message.key = keyCodeChar;

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

        chrome.runtime.sendMessage(message, url => {
            console.log(keyCodeChar, url);
            window.open(url);
        });
    } else if ([37, 39].indexOf(e.keyCode) > -1) { // left key and right key is 37 and 39
        const numberOfEntries = window.history.length - 1;
        //Step value is -1 if the left key,otherwise +1 if right key.
        const step = e.keyCode - 38;

        for (var i = 0; i < numberOfEntries; i++) {
            window.history.go(step);
        }
    }
}

/*
 * Check the event key modifier is valid or not.
 */
function isValidModifier(e) {
    return e.shiftKey && e.altKey;
}

document.addEventListener('keyup', monitorKeyUp, false);
