require('../less/tour.less');
// .jpg file cannot handle by file-loader, bug?
require('../img/2.jpg');
require('../img/3.jpg');

import Vue from "vue";
import common from "./common.js";
import client from "./client.js";
import config from "./config.js";
import ga from "./mixin-ga.js";
import Raven from "raven-js";
import RavenVue from 'raven-js/plugins/vue';
import monitor from './script/key-event-monitor.js';

Raven.config('https://0aa6274679824a129c33c2cc4ae0d22b@sentry.io/144189').addPlugin(RavenVue, Vue).install();

let $background = chrome.extension.getBackgroundPage();
window.delay = true;

const app = new Vue({
    el: "#app",
    data: {
        currentStep: 1,
        currentMaxStep: 1,
        defaultShortcuts: [],
        done: false,
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
        },
        bindDefaultShortcuts() {
            let keys = "";
            this.defaultShortcuts.forEach(shortcut => {
                if (shortcut.active) {
                    keys += shortcut.key;
                }
            });

            client.bindDefaultShortcuts(keys).then(data => {
                $background.syncAllShortcuts();
                // Disable default shortcut list
                this.done = true;
            });
        },
        /**
         * Initialize to determine which step current tour should be.
         */
        initialize() {
            this.currentStep = 2;

            client.getDefaultShortcuts().then(data => {
                this.defaultShortcuts = data;
            });

            if (this.currentStep === 2) {
                document.addEventListener('keyup', monitor.onKeyUp, false);
                document.addEventListener('keydown', monitor.onKeyDown, false);
            }
        }
    },
    mounted() {
        if ($background.authenticated) {
            this.initialize();
        }
    },
    mixins: [ga],
});

window.addEventListener('storage', event => {
    // A storage event fired because of localStorage value changed.
    // Here we can detect user info has synced success.
    if (event.storageArea['user']) {
        app.initialize();
    }
});

chrome.runtime.onMessageExternal.addListener(function(message, sender, sendResponse) {
    if (message.authenticated) {
        app.initialize();
    }
});