import config from "../config.js";
import injector from "./injector.js";

let auth = {
    openAuthPage(){
        let url = config.baseURL + '/app.html#/login';
        window.open(url);
    },
    isAuthenticated(){
        return !!localStorage.getItem('token');
    },
    logout(){
        localStorage.removeItem('token');
    },
    signin(token){
        localStorage.setItem('token', token);
    }
};

export default auth;

