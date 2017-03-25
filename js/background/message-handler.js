import common from "../common.js";
import client from "./client.js";
import auth from "./auth.js";
import pref from "../prefs.js";

let primaryShortcuts = {};
let secondaryShortcuts = {};

chrome.tabs.onActivated.addListener(onTabActivated);
chrome.tabs.onUpdated.addListener(onTabUpdated);
chrome.runtime.onMessage.addListener(onMessageReceiver);

if (auth.isAuthenticated()) {
    getAllShortcuts();
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

/**
 * Query shortcut key according to the url.
 *@param url the url to query shortcut
 *@return the key if the url was bound,null otherwise
 */
function queryShortcutKeyByUrl(url) {
    let result = queryBindInfoByUrl(url);
    return result ? result.key : null;
}

/**Query the bind info key/value object by url.
 *
 * @param url
 * @returns the bind info. {"key":key,"value":value}
 */
function queryBindInfoByUrl(url) {
    for (let key in primaryShortcuts) {
        if (primaryShortcuts.hasOwnProperty(key)) {
            let info = primaryShortcuts[key];
            if (common.isUrlEquivalent(url, info.url)) {
                return {key: key, value: info};
            }
        }
    }
    return null;
}

/**
 * Check current tab url whether bound or not.
 *@param url current tab url
 *@return boolean true if the url was bound,false otherwise
 */
function checkUrlBound(url) {
    return queryShortcutKeyByUrl(url) !== null;
}

/**
 * Set a different popup icon according to current tab url whether bound or not.
 *@param bound whether the current tab url was bound with a shortcut
 */
function setPopupIcon(bound) {
    const icon = bound ? {
            path: {
                '16': 'images/icon32.png'
            }
        } : {
            path: {
                '16': 'images/icon32-gray.png'
            }
        };
    chrome.browserAction.setIcon(icon);
}

/**
 * Get bound domain from Secondary shortcuts by hostname.
 * @param hostname
 * @returns {*}
 */
function getBoundDomainByHostname(hostname) {
    for (let domain of Object.keys(secondaryShortcuts)) {
        if (secondaryShortcuts.hasOwnProperty(domain)
            && common.isHostnameEndsWithDomain(hostname, domain)) {
            return domain;
        }
    }
    return null;
}

function handleOnTabInfoUpdate(url) {
    setPopupIcon(url ? checkUrlBound(url) : false);
}

function onMessageReceiver(message, sender, sendResponse) {
    switch (true) {
        case message.request: {
            let key = message.key;
            if (primaryShortcuts.hasOwnProperty(key)) {
                let value = primaryShortcuts[key];
                sendResponse({
                    url: value.url,
                    byBlank: pref.isOpenPrimaryShortcutByBlank()
                });

                client.increaseShortcutOpenTimes(value.id)
                    .then(response => {
                        Object.assign(primaryShortcuts, response);
                    }).catch(error => {
                    console.log(error);
                });
            } else {
                // The shortcut key not bound yet.
                sendResponse(null);
            }
            break;
        }
        case message.remove: {
            // Delete the url shortcut.
            let shortcut = primaryShortcuts[message.key];
            client.unbindShortcut(shortcut.id)
                .then(response => {
                    delete primaryShortcuts[message.key];
                    sendResponse(true);
                    setPopupIcon(false);
                }).catch(error => {
                console.log(error);
                sendResponse(false);
            });
            break;
        }
        case message.save: {
            common.getCurrentTab(tab => {
                client.bindShortcut(message.key, {
                    url: tab.url,
                    title: tab.title,
                    favicon: tab.favIconUrl,
                    comment: message.comment,
                    primary: true,
                    force: message.force || false,
                }).then(response => {
                    Object.assign(primaryShortcuts, response);
                    sendResponse("Success");
                    setPopupIcon(true);
                }).catch(error => {
                    console.log(error);
                });
            });
            break;
        }
        case message.quickSecondaryRequest: {
            let primaryKey = message.primaryKey;
            let secondaryKey = message.secondaryKey;
            if (primaryShortcuts.hasOwnProperty(primaryKey)) {
                let value = primaryShortcuts[primaryKey];
                let domain = value.domain;

                let shortcuts = secondaryShortcuts[domain];
                if (shortcuts && shortcuts.hasOwnProperty(secondaryKey)) {
                    let shortcut = shortcuts[secondaryKey];
                    sendResponse({
                        url: shortcut.url,
                        byBlank: pref.isQuickOpenSecondaryShortcutByBlank()
                    });
                    client.increaseShortcutOpenTimes(shortcut.id)
                        .then(response => {
                            Object.assign(shortcuts, response);
                        }).catch(error => {
                        console.log(error);
                    });
                } else {
                    // Not bound any key for this domain name yet or not exist the key
                    sendResponse(null);
                }
            } else {
                // The shortcut key not bound yet.
                sendResponse(null);
            }
            break;
        }
        case message.secondaryRequest: {
            // Access options shortcut key for correct domain.
            let domain = getBoundDomainByHostname(message.location.hostname);
            if (domain) {
                let shortcuts = secondaryShortcuts[domain];
                if (shortcuts.hasOwnProperty(message.key)) {
                    let shortcut = shortcuts[message.key];
                    sendResponse({
                        url: shortcut.url,
                        byBlank: pref.isOpenSecondaryShortcutByBlank()
                    });
                    client.increaseShortcutOpenTimes(shortcut.id)
                        .then(response => {
                            Object.assign(shortcuts, response);
                        }).catch(error => {
                        console.log(error);
                    });
                    break;
                }
            }
            // Not bound any key for this domain name yet or not exist the key
            sendResponse(null);
            break;
        }
        case message.secondarySave: {
            // Save option access bound item data.
            common.getCurrentTab(tab => {
                client.bindShortcut(message.key, {
                    url: tab.url,
                    title: tab.title,
                    favicon: tab.favIconUrl,
                    comment: message.comment,
                    primary: false,
                    force: message.force || false,
                }).then(response => {
                    let domain = response[message.key]['domain'];
                    if (!secondaryShortcuts.hasOwnProperty(domain)) {
                        secondaryShortcuts[domain] = {}
                    }
                    Object.assign(secondaryShortcuts[domain], response);

                    sendResponse(true);
                }).catch(error => {
                    console.log(error);
                });
            });
            break;
        }
        case message.secondaryRemove: {
            client.unbindShortcut(message.id)
                .then(response => {
                    sendResponse(true);
                    let hostname = common.getHostnameFromUrl(message.url);
                    let domain = getBoundDomainByHostname(hostname);
                    let shortcuts = secondaryShortcuts[domain];
                    delete shortcuts[message.key];
                })
                .catch(error => {
                    sendResponse(false);
                });
            break;
        }
        case message.all: {
            // Return all shortcuts.
            let response = {};
            if (message.url) {
                // Only return the domain specific secondary shortcuts when the message.url was represent.
                let hostname = common.getHostnameFromUrl(message.url);
                let domain = getBoundDomainByHostname(hostname);
                response['secondaryShortcuts'] = domain ? secondaryShortcuts[domain] : {};
            } else {
                // Else return all secondary shortcuts.
                response['secondaryShortcuts'] = secondaryShortcuts;
            }
            response['primaryShortcuts'] = primaryShortcuts;
            sendResponse(response);
            break;
        }
        case message.loginSuccessful: {
            auth.signin();
            getAllShortcuts();
            break;
        }
        case message.logoutSuccessful: {
            auth.logout();
            primaryShortcuts = secondaryShortcuts = {};
            break;
        }
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
 * A callback function to detect current activated tab updated.
 *@param changeInfo looks like this {string:url,string:status...}
 *@param tab Gives the state of the tab that was updated.
 */
function onTabUpdated(tabId, changeInfo, tab) {
    handleOnTabInfoUpdate(tab.url);
}

/**
 * A callback function to detect tab activated change.
 *@param activeInfo looks like this {integer:tabId,integer:windowId}
 */
function onTabActivated(activeInfo) {
    //Get current activated tab
    chrome.tabs.get(activeInfo.tabId, tab => {
        handleOnTabInfoUpdate(tab.url);
    });
}