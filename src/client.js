import axios from "axios";
import config from "./config.js";

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
    unbindShortcut(id, including) {
        return request.put(`/shortcut/${id}/unbind`, {including: including});
    },
    increaseShortcutOpenTimes(id) {
        return request.put(`/shortcut/${id}/times`);
    },
    getAllShortcuts() {
        return request.get('/shortcuts/all');
    },
    getDefaultShortcuts() {
        return request.get('/shortcuts/default');
    },
    bindDefaultShortcuts(keys) {
        return request.post('/shortcut/default', {
            keys: keys
        });
    },
    getShortcutWeekStats(shortcutId) {
        return request.get(`/stats/shortcut?shortcut_id=${shortcutId}`);
    },
    getPrimarySecondaryShortcutWeekStats(primaryShortcutId) {
        return request.get(`/stats/primary?shortcut_id=${primaryShortcutId}`);
    },
};