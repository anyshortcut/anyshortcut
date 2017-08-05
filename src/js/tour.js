import Vue from "vue";
import auth from "./background/auth.js";
import config from "../js/config.js";

const app = new Vue({
    el: "#app",
    data: {
        currentStep: 0,
    },
    methods: {
        openAuthPopupWindow() {
            chrome.windows.create({
                'url': config.baseURL + '/oauth/google',
                'type': 'popup',
                "focused": true,
                "width": 500,
                "height": 800
            });
        },
    },
    created() {
        this.currentStep = auth.isAuthenticated() ? 1 : 0;
    },
});


chrome.runtime.onMessageExternal.addListener(function(message, sender, sendResponse) {
    console.log(message);
    app.currentStep = 1;
});

