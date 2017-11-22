const dictionaries = {
    48: "0",
    49: "1",
    50: "2",
    51: "3",
    52: "4",
    53: "5",
    54: "6",
    55: "7",
    56: "8",
    57: "9",
    65: "A",
    66: "B",
    67: "C",
    68: "D",
    69: "E",
    70: "F",
    71: "G",
    72: "H",
    73: "I",
    74: "J",
    75: "K",
    76: "L",
    77: "M",
    78: "N",
    79: "O",
    80: "P",
    81: "Q",
    82: "R",
    83: "S",
    84: "T",
    85: "U",
    86: "V",
    87: "W",
    88: "X",
    89: "Y",
    90: "Z"
};

export default {
    delayTime: 200,
    ensureWindowEvent(e) {
        return e ? e : window.event;
    },
    isValidKeyEvent(e) {
        return this.isValidKeyCode(e.keyCode) && this.withAltModifier(e);
    },
    /**
     * Check the keyCode whether is valid.
     */
    isValidKeyCode(keyCode) {
        return dictionaries[keyCode];
    },
    withoutAnyModifier(e) {
        return e && !e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey;
    },
    /*
     * Check the event key modifier is full valid or not.
     */
    withAltModifier(e) {
        return e && e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey;
    },
    /**
     * A function return whether current active element is a input element or a editable element.
     * Mainly usage to prevent trigger shortcut when in these cases.
     */
    isActiveElementEditable() {
        return document.activeElement.isContentEditable
            || ['INPUT', 'TEXTAREA', 'SELECT'].lastIndexOf(document.activeElement.tagName) !== -1;
    },
    openShortcut(shortcut, byBlank) {
        let url = shortcut.url;
        if (byBlank) {
            window.open(url);
        } else {
            location.href = url;
        }

        chrome.runtime.sendMessage({
            increase: true,
            shortcutId: shortcut.id,
            shortcutKey: shortcut.key,
        });
    },
};