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
        chrome.runtime.sendMessage(message, url => {
            console.log(keyCodeChar, url);
            window.open(url);
        });
    } else if (e.keyCode == 32) { //space key code is 32.
        //TrickTips: Navigate to current tab href origin url or domain url.
        const a = document.createElement('a');
        a.href = location.href;
        if (a.pathname != '/') {
            //Navigate to origin url
            window.location = a.origin;
        } else {
            //Navigate to domain url
            const parts = a.origin.split('.');
            parts.shift();
            const domain = a.protocol + '\/\/' + parts.join('.');
            window.location = domain;
        }

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
