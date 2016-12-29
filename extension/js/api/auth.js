import config from "../config.js";
import injector from "../background/injector.js";

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
        localStorage.setItem('authenticated', false);
    },
    signin(){
        localStorage.setItem('authenticated', true);
    }
};

export default auth;

