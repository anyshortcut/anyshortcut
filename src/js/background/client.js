import axios from "axios";
import config from "../config.js";

let request = axios.create({
    baseURL: config.apiURL,
    contentType: "application/json; charset=utf-8",
});

// Add custom axios interceptor for custom error handle.
request.interceptors.response.use(response => {
    let code = response.data.code;
    if (code !== 200) {
        return Promise.reject(response.data);
    }
    return response.data.data;
}, error => {
    return Promise.reject(error)
});

export default {
    getUserInfo() {
        return request.get('/user/info');
    },
    bindShortcut(shortcut) {
        return request.post('/shortcut/key', shortcut);
    },
    unbindShortcut(id) {
        return request.put(`/shortcut/${id}/unbind`);
    },
    increaseShortcutOpenTimes(id) {
        return request.put(`/shortcut/${id}/times`);
    },
    /**
     * Get all shortcut data from server
     */
    getPrimaryShortcuts() {
        return request.get('/shortcuts?type=primary');
    },
    getSecondaryShortcuts() {
        return request.get('/shortcuts?type=secondary');
    },
};