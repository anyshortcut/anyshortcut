import {origin} from './client.js';
import config from '../config.js';
import injector from '../background/injector.js';
let storage = chrome.storage.local;

let auth = {
    authenticated: false,
    openAuthPopupWindow(){
        let url = config.baseURL + 'oauth/google';
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
    signOut(){
        this.authenticated = false;
    },
    signIn(){
        this.authenticated = true;
        origin.getAll().then(response => {
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
            auth.signIn();
            console.log('login success');
            break;
        case message.logout:
            auth.signOut();
            break;
        default:
            break;
    }
});

export default auth;

