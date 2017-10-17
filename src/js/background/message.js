import client from '../client.js';
import common from '../common.js';
import pref from '../prefs.js';

const subscription = {
    status: null,
    endAt: null,
};

window.authenticated = false;

syncUserInfo();

function syncUserInfo() {
    client.getUserInfo().then(response => {
        if (response) {
            window.authenticated = true;
            window.subscriptionStatus = subscription.status = response.subscription_status;
            window.subscriptionEndAt = subscription.endAt = response.subscription_end_at;

            window.syncAllShortcuts();

            // Tell all opened tabs that user has authenticated
            common.iterateAllWindowTabs(tabId => {
                chrome.tabs.sendMessage(tabId, {authenticated: true});
            });
            localStorage.setItem('user', JSON.stringify(response));
        }
    });
}

/**
 * Check the subscription end datetime whether expired.
 * @returns {boolean} true expired, otherwise false
 */
window.checkSubscriptionExpired = function() {
    return ['active', 'trialing'].lastIndexOf(subscription.status) === -1;
};


function isSecondaryShortcutActivatedUrl(url) {
    let hostname = common.getHostnameFromUrl(url);
    let domain = window.getBoundDomainByHostname(hostname);
    return domain && Object.keys(window.secondaryShortcuts[domain]).length > 0;
}

function onMessageReceiver(message, sender, sendResponse) {
    if (message.info) {
        let showCircle = false;
        let config = pref.getShowCircleConfig();
        if (config === 'always') {
            showCircle = true;
        } else if (config === 'never') {
            showCircle = false;
        } else if (config === 'only') {
            showCircle = isSecondaryShortcutActivatedUrl(message.url);
        }

        sendResponse({
            authenticated: window.authenticated,
            expired: checkSubscriptionExpired(),
            status: subscription.status,
            showCircle: showCircle,
        });
        return true;
    }

    if (checkSubscriptionExpired()) {
        // The subscription was expired.
        sendResponse({expired: true, status: subscription.status});
        return true;
    }

    switch (true) {
        case message.query: {
            sendResponse({
                byBlank: pref.isShortcutOpenByBlank(),
                primaryShortcut: window.getPrimaryShortcut(message.firstKey + message.secondKey),
                secondaryShortcut: window.getSecondaryShortcutQuickly(message.firstKey, message.secondKey),
            });
            break;
        }
        case message.request: {
            sendResponse({
                byBlank: pref.isShortcutOpenByBlank(),
                shortcut: window.getPrimaryShortcut(message.key)
            });
            break;
        }
        case message.listSecondary: {
            let shortcuts = null;
            if (message.key) {
                shortcuts = window.getSecondaryShortcutsByPrimaryKey(message.key);
            } else if (message.url) {
                shortcuts = window.getSecondaryShortcutsByUrl(message.url);
            }

            sendResponse({
                byBlank: pref.isShortcutOpenByBlank(),
                shortcuts: shortcuts
            });
            break
        }
        case message.increase:
            client.increaseShortcutOpenTimes(message.shortcutId)
                .then(response => {
                    let shortcut = response[message.shortcutKey];
                    if (shortcut.primary) {
                        Object.assign(window.primaryShortcuts, response);
                    } else {
                        Object.assign(window.secondaryShortcuts[shortcut.domain], response);
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
    syncUserInfo();
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
