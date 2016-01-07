function monitorKeyUp(e) {
    e = ensureWindowEvent(e);

    console.log("key:", keycode_dictionary[e.keyCode]);

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

function ensureWindowEvent(e) {
    return e ? e : window.event;
}

function isValidModifier(e) {
    return e.shiftKey && e.altKey;
}

document.addEventListener("keyup", monitorKeyUp, false);
// document.addEventListener('DOMContentLoaded', function() {
// };
