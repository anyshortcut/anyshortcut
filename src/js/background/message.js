import auth from '../auth.js';
import client from './client.js';
import common from '../common.js';
import pref from '../prefs.js';

if (auth.isAuthenticated()) {
    doAfterAuthenticated();
}

function doAfterAuthenticated() {
    window.syncAllShortcuts();
    pref.sync();

    common.iterateAllWindowTabs(tabId => {
        chrome.tabs.sendMessage(tabId, {authenticated: true});
    });
}

function onMessageReceiver(message, sender, sendResponse) {
    switch (true) {
        case message.resolve: {
            sendResponse(auth.isAuthenticated());
            break;
        }
        case message.query: {
            sendResponse({
                byBlank: {
                    primary: pref.isQuickSecondaryBlank(),
                    secondary: pref.isQuickSecondaryBlank(),
                },
                primaryShortcut: window.getPrimaryShortcut(message.firstKey + message.secondKey),
                secondaryShortcut: window.getSecondaryShortcutQuickly(message.firstKey, message.secondKey),
            });
            break;
        }
        case message.request: {
            sendResponse({
                byBlank: pref.isPrimaryBlank(),
                shortcut: window.getPrimaryShortcut(message.key)
            });
            break;
        }
        case message.secondaryRequest: {
            sendResponse({
                byBlank: pref.isSecondaryBlank(),
                shortcut: window.getSecondaryShortcut(message.hostname, message.key)
            });
            break;
        }
        case message.listSecondary: {
            sendResponse({
                byBlank: pref.isQuickSecondaryBlank(),
                shortcuts: window.getSecondaryShortcutsByPrimaryKey(message.key)
            });
            break
        }
        case message.increase:
            client.increaseShortcutOpenTimes(message.shortcutId)
                .then(response => {
                    if (message.primary) {
                        Object.assign(window.primaryShortcuts, response);
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
    console.log('primary:', window.primaryShortcuts);
    console.log('secondary:', window.secondaryShortcuts);
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

window.notifyActiveTabShortcutBindSuccess = function(shortcut) {
    let key = shortcut.primary ? 'success-bind-times-primary' : 'success-bind-times-secondary';
    let showTimes = parseInt(localStorage.getItem(key) || 0);
    //  Only notify active tab three for each type shortcut.
    if (showTimes < 3) {
        localStorage.setItem(key, showTimes + 1);
        if (shortcut.primary) {
            chrome.tabs.sendMessage(window.activeTab.id, {
                bindSuccess: true,
                shortcut: shortcut,
            });
        } else {
            chrome.tabs.sendMessage(window.activeTab.id, {
                bindSuccess: true,
                shortcut: shortcut,
                primaryShortcut: window.getPrimaryShortcutByDomain(shortcut.domain),
            });
        }
    }
};

chrome.runtime.onMessage.addListener(onMessageReceiver);
chrome.runtime.onMessageExternal.addListener(onMessageExternal);
