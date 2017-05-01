import config from "../config.js";
import injector from "./injector.js";

let auth = {
    openAuthPopupWindow(){
        let url = config.baseURL + '/app.html#/login';
        window.open(url);
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

