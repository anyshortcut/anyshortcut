import config from "./config.js";

let auth = {
    openAuthPopupWindow() {
        let url = config.baseURL + '/oauth/google';
        let width = 700, height = 600;
        let windowFeatures = `width=${width},height=${height},resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=no`;
        let authWindow = window.open(url, 'AnyShortcut', windowFeatures);
        authWindow.focus && authWindow.focus();
    },
    isAuthenticated() {
        return !!localStorage.getItem('token');
    },
    logout() {
        localStorage.removeItem('token');
    },
    signin(token) {
        localStorage.setItem('token', token);
    }
};

export default auth;

