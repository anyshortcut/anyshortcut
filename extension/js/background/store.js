import {origin, option} from '../api/client.js';
import auth from '../api/auth.js';

chrome.storage.onChanged.addListener((changes, areaName)=> {
    // sync data if the user authenticated.
    if (!auth.authenticated) {
        return;
    }

    for (let key in changes) {
        if (changes.hasOwnProperty(key)) {
            let change = changes[key];
            console.log(key, change);

            if (key.length === 1) {
                // Origin shortcut
                if (change.newValue && !change.oldValue) {
                    // a new value added
                    origin.bindShortcut(null);
                } else if (!change.newValue && change.oldValue) {
                    //  a old value removed
                } else if (change.newValue && change.oldValue) {
                    // a value updated
                }
            } else {
                // Option shortcut
                if (change.newValue && !change.oldValue) {
                    // a new value added
                    option.bindShortcut(null);
                } else if (!change.newValue && change.oldValue) {
                    //  a old value removed
                } else if (change.newValue && change.oldValue) {
                    // a value updated
                }
            }
        }
    }
});