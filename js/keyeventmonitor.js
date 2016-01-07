function monitorKeyUp(e) {
    e = keyCodeHelper.ensureWindowEvent(e);

    if (isValidModifier(e) && keyCodeHelper.isValidKeyCode(e.keyCode)) {
        var message = {};
        //A flag to tell backgound.js the message is from Content Script.
        message.request = true;
        var keyCodeChar = String.fromCharCode(e.keyCode);
        message.key = keyCodeChar;
        chrome.runtime.sendMessage(message, function(url) {
            console.log(keyCodeChar, url);
            window.open(url);
        });
    }
}

function isValidModifier(e) {
    return e.shiftKey && e.altKey;
}

document.addEventListener("keyup", monitorKeyUp, false);
// document.addEventListener('DOMContentLoaded', function() {
// };
