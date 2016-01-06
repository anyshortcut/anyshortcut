function monitorKeyUp(e) {
    e = ensureWindowEvent(e);
    // if(e.keycode != "undefined"){
    console.log("key:", keycode_dictionary[e.keyCode]);
    // console.log("isValidModifier:",isValidModifier(e));
    if (isValidModifier(e)) {
        if (e.keyCode == 90) {
            window.open("http://www.geowind.cn");
        } else if (e.keyCode == 71) {
            window.open("http://www.google.com.sg");
        }
    }
    // }
}

function ensureWindowEvent(e) {
    return e ? e : window.event;
}

function isValidModifier(e) {
    return e.shiftKey && e.altKey;
}

document.addEventListener("keyup", monitorKeyUp, false);
