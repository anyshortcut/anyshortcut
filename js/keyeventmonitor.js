function monitorKeyUp(e) {
    e = keyCodeHelper.ensureWindowEvent(e);

    console.log("key:", keyCodeHelper.dictionaries[e.keyCode]);

    if (isValidModifier(e)) {
        if (e.keyCode == 90) {
            window.open("http://www.geowind.cn");
        } else if (e.keyCode == 71) {
            window.open("http://www.google.com.sg");
        }

        chrome.runtime.sendMessage("key_code", function(keyCodes) {
            console.log(keyCodes);
        });
    }
}

function isValidModifier(e) {
    return e.shiftKey && e.altKey;
}

document.addEventListener("keyup", monitorKeyUp, false);
// document.addEventListener('DOMContentLoaded', function() {
// };
