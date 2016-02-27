var keyCodeHelper = {
    dictionaries: {
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
    },
    ensureWindowEvent: function(e) {
        return e ? e : window.event;
    },
    /**
     * Check the keyCode whether is valid.
     */
    isValidKeyCode: function(keyCode) {
        return this.dictionaries[keyCode];
    },
    /**
     * Check the key whether is valid.
     */
    isValidKey: function(key) {
        return key.length === 1 && this.isValidKeyCode(key.charCodeAt());
    }
};
