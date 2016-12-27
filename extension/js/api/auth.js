import client from "./client.js";
import config from "../config.js";
import injector from "../background/injector.js";
let storage = chrome.storage.local;

let auth = {
    openAuthPopupWindow(){
        let url = config.baseURL + '/oauth/google';
        chrome.windows.create({
            'url': url,
            'type': 'popup',
            "focused": true,
            "width": 500,
            "height": 800
        }, window => {
            console.log(window);
            if (window.focused) {
                let tab = window.tabs[0];
                injector.injectAuthPopupWindowScript(tab.id);
            }
        });
    },
    isAuthenticated(){
        return localStorage.getItem('authenticated') === 'true';
    },
    logout(){
        storage.clear(() => {
            localStorage.setItem('authenticated', false);
        });
    },
    signin(){
        localStorage.setItem('authenticated', true);
        client.getPrimaryShortcuts().then(response => {
            let shortcuts = response.shortcuts || [];
            shortcuts.forEach(item => {
                let bind = {};
                bind[item.key] = item;
                storage.set(bind);
            });
            chrome.runtime.sendMessage({refresh: true});
        }).catch(error => {
            console.log(error);
        })
    }
};

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch (true) {
        case message.loginSuccessful:
            auth.signin();
            console.log('login success');
            break;
        case message.logout:
            auth.logout();
            break;
        default:
            break;
    }
});

export default auth;

