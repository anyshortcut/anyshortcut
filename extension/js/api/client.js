import axios from 'axios';

let request = axios.create({
    baseURL: 'https://shurlly.herokuapp.com/',
    headers: {
        'Authorization': 'eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0NzcyNDA5OTYsImlkIjoxfQ.VakwR7efpnjI35hjOMg-efDn-QiYNFeI1VNTzo4BELc'
    },
    contentType: "application/json; charset=utf-8",
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
        return request.post('shortcut/' + key, shortcut);
    },
    unbindShortcut(id){
        return request.delete('shortcut/' + id);
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