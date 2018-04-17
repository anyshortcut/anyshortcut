import client from '../client.js';
import common from '../common.js';
import pref from '../prefs.js';
import _ from "lodash";

const subscription = {
    status: null,
    endAt: null,
};

syncUserInfo();

function syncUserInfo() {
    // Clear previous user data
    localStorage.removeItem('user');
    window.authenticated = false;

    client.getUserInfo().then(response => {
        if (response) {
            window.authenticated = true;
            window.subscriptionStatus = subscription.status = response.subscription.status;
            window.subscriptionEndAt = subscription.endAt = response.subscription.end_at;
            localStorage.setItem('user', JSON.stringify(response.user));

            window.syncAllShortcuts();
        }
    });
}

/**
 * Check the subscription end datetime whether expired.
 * @returns {boolean} true expired, otherwise false
 */
window.checkSubscriptionExpired = function() {
    return !['active', 'trialing'].includes(subscription.status);
};


function isSecondaryShortcutActivatedUrl(url) {
    let hostname = common.getHostnameFromUrl(url);
    let domain = window.getBoundDomainByHostname(hostname);
    return domain && Object.keys(window.secondaryShortcuts[domain]).length > 0;
}

/**
 * Check whether have secondary shortcuts or primary shortcuts have compound shortcut.
 *
 * @returns {boolean} true if should delay, flase otherwise
 */
function determineDelay() {
    return Object.keys(window.secondaryShortcuts).length > 0 ||
        !_.isEmpty(_.pickBy(window.primaryShortcuts, (value, key) => {
            return key.length === 2;
        }));
}

function onMessageReceiver(message, sender, sendResponse) {
    console.log('message:', message);

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
            showCircle: showCircle,
            // Whether trigger primary shortcut delay
            delay: determineDelay(),
        });
        return true;
    } else if (message.firefoxRefresh) {
        // User logged in Firefox browser.
        syncUserInfo();
        sendResponse('ok');
        return true;
    } else if (message.jumpSecondary) {
        // Get the secondary shortcut according to the domain url and secondary key.
        let shortcut = window.getSecondaryShortcut(common.getHostnameFromUrl(message.url), message.key);
        if (shortcut) {
            chrome.tabs.update(window.activeTab.id, {url: shortcut.url});
        }
        return true;
    }

    if (!window.authenticated) {
        sendResponse({
            authenticateRequired: true,
        });
        return true;
    }

    if (checkSubscriptionExpired()) {
        // The subscription was expired.
        sendResponse({expired: true, status: subscription.status});
        return true;
    }

    let combinationKey = pref.getDefaultCombinationKey();
    switch (true) {
        case message.request: {
            if (message.modifier !== combinationKey) {
                sendResponse({wrongModifier: true});
                break;
            }

            let shortcut = window.getPrimaryShortcut(message.key);
            if (shortcut) {
                window.openShortcut(shortcut);
            } else {
                sendResponse({
                    shortcut: null
                });
            }
            break;
        }
        case message.query: {
            if (message.modifier !== combinationKey) {
                sendResponse({wrongModifier: true});
                break;
            }

            let primaryShortcut = window.getPrimaryShortcut(message.firstKey + message.secondKey);
            let secondaryShortcut = window.getSecondaryShortcutQuickly(message.firstKey, message.secondKey);
            if (primaryShortcut && secondaryShortcut) {
                sendResponse({
                    primaryShortcut: primaryShortcut,
                    secondaryShortcut: secondaryShortcut
                });
            } else if (!primaryShortcut && !secondaryShortcut) {
                sendResponse({
                    primaryShortcut: null,
                    secondaryShortcut: null
                });
            } else {
                window.openShortcut(primaryShortcut || secondaryShortcut);
            }
            break;
        }
        case message.open: {
            window.openShortcut({url: message.url, id: message.shortcutId});
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
                shortcuts: shortcuts
            });
            break;
        }
        default: {
            break;
        }
    }
    //Must return true otherwise sendResponse() not working.
    //More detail see official documentations [chrome.runtime.onMessage()].
    return true;
}

/**
 * Receive external message.
 */
function onMessageExternal(message, sender, sendResponse) {
    console.log(message);
    if (message.authenticated || message.refresh) {
        syncUserInfo();
        sendResponse(true);
    }
    return true;
}

window.notifyActiveTabShortcutBindSuccess = function(shortcut) {
    let key = shortcut.primary ? 'success-bind-times-primary' : 'success-bind-times-secondary';
    let showTimes = parseInt(localStorage.getItem(key) || 0);
    //  Only notify active tab three for each type shortcut.
    if (showTimes < 3) {
        localStorage.setItem(key, showTimes + 1);
        let combinationKey = pref.getDefaultCombinationKey();
        if (shortcut.primary) {
            chrome.tabs.sendMessage(window.activeTab.id, {
                bindSuccess: true,
                shortcut: shortcut,
                delay: determineDelay(),
                combinationKey: combinationKey,
            });
        } else {
            chrome.tabs.sendMessage(window.activeTab.id, {
                bindSuccess: true,
                shortcut: shortcut,
                primaryShortcut: window.getPrimaryShortcutByDomain(shortcut.domain),
                delay: determineDelay(),
                combinationKey: combinationKey,
            });
        }
    }
};

chrome.runtime.onMessage.addListener(onMessageReceiver);
chrome.runtime.onMessageExternal.addListener(onMessageExternal);
