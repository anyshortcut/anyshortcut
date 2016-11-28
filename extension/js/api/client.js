import axios from 'axios';
import auth from '../api/auth.js';

let request = axios.create({
    baseURL: 'https://shurlly.herokuapp.com/',
    contentType: "application/json; charset=utf-8",
});

// Add custom axios interceptor for custom request authenticated check.
request.interceptors.request.use(config => {
    console.log(config);
    if (auth.token) {
        config.headers.common['Authorization'] = auth.token;
    }
    // return Promise.resolve(config.data);
    return config;
}, error => {
    return Promise.reject(error);
});
// Add custom axios interceptor for custom error handle.
request.interceptors.response.use(response => {
    if (response.data.code !== 200) {
        return Promise.reject(response.data);
    }
    return response.data.data;
}, error => {
    return Promise.reject(error)
});

let origin = {
    bindShortcut(key, shortcut){
        return request.post(`shortcut/${key}`, shortcut);
    },
    unbindShortcut(id){
        return request.put(`shortcut/${id}/unbind`);
    },
    increaseShortcutOpenTimes(id){

    },
    /**
     * Get all shortcut data from server
     */
    getAll(){

    },
    /**
     * Sync all shortcut data to server
     */
    syncAll(){

    }
};

let option = {
    bindShortcut(shortcut){

    },
};

export {origin, option};