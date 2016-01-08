function monitorKeyUp(e) {
    e = keyCodeHelper.ensureWindowEvent(e);
    if (!isValidModifier(e)) {
        return;
    }

    if (keyCodeHelper.isValidKeyCode(e.keyCode)) {
        var message = {};
        //A flag to tell backgound.js the message is from Content Script.
        message.request = true;
        var keyCodeChar = String.fromCharCode(e.keyCode);
        message.key = keyCodeChar;
        chrome.runtime.sendMessage(message, function(url) {
            console.log(keyCodeChar, url);
            window.open(url);
        });
    } else if (e.keyCode == 32) { //space key code is 32.
        //TrickTips: Navigate to current tab href origin url.
        var a = document.createElement('a');
        a.href = location.href;
        window.location = a.origin;
    }
}

/*
 * Check the event key modifer is valid or not.
 */
function isValidModifier(e) {
    return e.shiftKey && e.altKey;
}

document.addEventListener("keyup", monitorKeyUp, false);
// document.addEventListener('DOMContentLoaded', function() {
// };
