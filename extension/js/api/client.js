import axios from 'axios';
import auth from './auth.js';
import config from '../config.js';

let request = axios.create({
    baseURL: config.baseURL,
    contentType: "application/json; charset=utf-8",
});

// Add custom axios interceptor for custom error handle.
request.interceptors.response.use(response => {
    let code = response.data.code;
    if (code !== 200) {
        if (code === 1000 || code === 1001) {
            // Miss token or invalid token
            auth.logout();
        }
        return Promise.reject(response.data);
    }
    return response.data.data;
}, error => {
    return Promise.reject(error)
});

let origin = {
    bindShortcut(key, shortcut){
        return request.post(`shortcut/key/${key}`, shortcut);
    },
    unbindShortcut(id){
        return request.put(`shortcut/${id}/unbind`);
    },
    increaseShortcutOpenTimes(id){
        return request.put(`shortcut/${id}/times`);

    },
    /**
     * Get all shortcut data from server
     */
    getAll(){
        return request.get('shortcuts');
    },
};

let option = {
    bindShortcut(shortcut){

    },
};

export {origin, option};