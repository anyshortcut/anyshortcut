import auth from './auth.js';
import client from './client.js';
import common from '../common.js';
import pref from '../prefs.js';

window.primaryShortcuts = {};
window.secondaryShortcuts = {};

if (auth.isAuthenticated()) {
    doAfterAuthenticated();
}

function doAfterAuthenticated() {
    getAllShortcuts();
    pref.sync();

    common.iterateAllWindowTabs(tabId => {
        chrome.tabs.sendMessage(tabId, {authenticated: true});
    });
}

/**
 * Get all shortcuts from server.
 */
function getAllShortcuts() {
    client.getPrimaryShortcuts().then(shortcuts => {
        shortcuts = shortcuts || [];
        shortcuts.forEach(item => {
            Object.assign(primaryShortcuts, item)
        });
        console.log('primary:', primaryShortcuts);
    }).catch(error => {
        console.log(error);
    });

    client.getSecondaryShortcuts().then(shortcuts => {
        secondaryShortcuts = shortcuts || {};
        console.log('secondary:', secondaryShortcuts);
    }).catch(error => {
        console.log(error);
    });
}

function makeResponseShortcut(shortcut, byBlank) {
    return {
        id: shortcut.id,
        url: shortcut.url,
        title: shortcut.title,
        favicon: shortcut.favicon,
        comment: shortcut.comment,
        primary: shortcut.primary,
        byBlank: byBlank,
    }
}

function requestPrimaryShortcut(key) {
    if (primaryShortcuts.hasOwnProperty(key)) {
        let shortcut = primaryShortcuts[key];
        return makeResponseShortcut(shortcut, pref.isPrimaryBlank());
    } else {
        // The shortcut key not bound yet.
        return null;
    }
}

function requestSecondaryShortcut(key, hostname) {
    // Access options shortcut key for correct domain.
    let domain = window.getBoundDomainByHostname(hostname);
    if (domain) {
        let shortcuts = secondaryShortcuts[domain];
        if (shortcuts.hasOwnProperty(key)) {
            let shortcut = shortcuts[key];
            return makeResponseShortcut(shortcut, pref.isSecondaryBlank());
        }
    } else {
        // Not bound any key for this domain name yet or not exist the key
        return null;
    }
}

function quickRequestSecondaryShortcut(primaryKey, secondaryKey) {
    if (primaryShortcuts.hasOwnProperty(primaryKey)) {
        let value = primaryShortcuts[primaryKey];
        let domain = value.domain;

        let shortcuts = secondaryShortcuts[domain];
        if (shortcuts && shortcuts.hasOwnProperty(secondaryKey)) {
            let shortcut = shortcuts[secondaryKey];
            return makeResponseShortcut(shortcut, pref.isQuickSecondaryBlank());
        } else {
            // Not bound any key for this domain name yet or not exist the key
            return null;
        }
    } else {
        // The shortcut key not bound yet.
        return null;
    }
}

function onMessageReceiver(message, sender, sendResponse) {
    switch (true) {
        case message.query: {
            sendResponse({
                primaryShortcut: requestPrimaryShortcut(message.firstKey + message.secondKey),
                secondaryShortcut: quickRequestSecondaryShortcut(message.firstKey, message.secondKey),
            });
            break;
        }
        case message.request: {
            sendResponse(requestPrimaryShortcut(message.key));
            break;
        }
        case message.secondaryRequest: {
            sendResponse(requestSecondaryShortcut(message.key, message.hostname));
            break;
        }
        case message.all: {
            // Return all shortcuts.
            let response = {};
            if (message.url) {
                // Only return the domain specific secondary shortcuts when the message.url was represent.
                let hostname = common.getHostnameFromUrl(message.url);
                let domain = window.getBoundDomainByHostname(hostname);
                response['secondaryShortcuts'] = domain ? secondaryShortcuts[domain] : {};
            } else {
                // Else return all secondary shortcuts.
                response['secondaryShortcuts'] = secondaryShortcuts;
            }
            response['primaryShortcuts'] = primaryShortcuts;
            sendResponse(response);
            break;
        }
        case message.increase:
            client.increaseShortcutOpenTimes(message.shortcutId)
                .then(response => {
                    if (message.primary) {
                        Object.assign(primaryShortcuts, response);
                    } else {
                        // TODO secondary shortcut case...
                    }
                }).catch(error => {
                console.log(error);
            });
            break;
        default: {
            break;
        }
    }
    console.log('primary:', primaryShortcuts);
    console.log('secondary:', secondaryShortcuts);
    //Must return true otherwise sendResponse() not working.
    //More detail see official documentations [chrome.runtime.onMessage()].
    return true;
}

/**
 * Receive external message.
 */
function onMessageExternal(message, sender, sendResponse) {
    console.log(message);
    auth.signin(message.token);
    doAfterAuthenticated();
    sendResponse(true);
    return true;
}

chrome.runtime.onMessage.addListener(onMessageReceiver);
chrome.runtime.onMessageExternal.addListener(onMessageExternal);
