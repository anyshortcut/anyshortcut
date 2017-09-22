import Vue from "vue";
import common from "./common.js";
import config from "./config.js";
import ga from "./mixin-ga.js";
import helper from './script/helper.js';

require('../less/tour.less');

let authenticated = chrome.extension.getBackgroundPage().authenticated;

const app = new Vue({
    el: "#app",
    data: {
        currentStep: authenticated ? 2 : 1,
        currentMaxStep: this.currentStep,
    },
    watch: {
        currentStep: function(newValue) {
            this.currentMaxStep = Math.max(this.currentMaxStep, newValue);
        }
    },
    methods: {
        openAuthPopupWindow() {
            common.openPopupWindow(config.googleAuthURL);
        },
        openShortcut(url) {
            window.open(url);
            this.currentStep += 1;
        },
        onStepItemClick(step) {
            if (1 < step && step <= this.currentMaxStep) {
                this.currentStep = step;
            }
        }
    },
    mixins: [ga],
});


chrome.runtime.onMessageExternal.addListener(function(message, sender, sendResponse) {
    app.currentStep = 2;
});

const EMPTY_KEY = {
    keyCode: 0,
    keyCodeChar: null,
    altKey: false,
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    pressedAt: null,
    releasedAt: null,
};

let firstKey = EMPTY_KEY;
let secondKey = EMPTY_KEY;
let triggerTimeoutId = null;


function monitorKeyUp(e) {
    if (!helper.isValidAltModifier(e)) {
        // Ignore invalid modifier key
        return;
    }

    if (helper.isValidKeyCode(e.keyCode)) {
        if (!firstKey.releasedAt) {
            firstKey.releasedAt = Date.now();
        } else if (!secondKey.releasedAt) {
            secondKey.releasedAt = Date.now();
        }

        triggerShortcut()
    }
}

function monitorKeyDown(e) {
    if (!helper.isValidAltModifier(e)) {
        // Ignore invalid full modifier key
        return;
    }

    let keyCode = e.keyCode;
    if (!helper.isValidKeyCode(keyCode)) {
        // Ignore invalid key code.
        return;
    }

    // Prevent repeat trigger down event.
    if (e.repeat) {
        return;
    }

    let pressedKey = {
        keyCode: keyCode,
        keyCodeChar: String.fromCharCode(keyCode),
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        pressedAt: Date.now(),
        releasedAt: null,
    };

    if (!firstKey.pressedAt) {
        firstKey = pressedKey;
    } else if (!secondKey.pressedAt) {
        secondKey = pressedKey;
    }
}

function triggerShortcut() {
    if (triggerTimeoutId) {
        // Clear previous session timeout if existed
        window.clearTimeout(triggerTimeoutId);
        triggerTimeoutId = null;
    }

    if (firstKey.pressedAt && firstKey.releasedAt) {
        if (helper.isValidAltModifier(firstKey)) {
            if (secondKey.pressedAt && secondKey.releasedAt) {
                if (app.currentStep === 3 && firstKey.keyCodeChar === 'G' && secondKey.keyCodeChar === 'I') {
                    app.openShortcut('https://inbox.google.com');
                }
                cleanUp();
            } else {
                triggerTimeoutId = window.setTimeout(function() {
                    if (app.currentStep === 2 && firstKey.keyCodeChar === 'G') {
                        app.openShortcut('https://www.google.com');
                    }
                    cleanUp();
                }, helper.delayTime);
            }
        }
    }
}

function cleanUp() {
    firstKey = EMPTY_KEY;
    secondKey = EMPTY_KEY;
}

document.addEventListener('keyup', monitorKeyUp, false);
document.addEventListener('keydown', monitorKeyDown, false);