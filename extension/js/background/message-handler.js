import injector from "./injector.js";
import common from "../common.js";
import keyCodeHelper from "../keycode.js";
import client from "../api/client.js";
import auth from "../api/auth.js";

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
    client.getPrimaryShortcuts().then(response => {
        let shortcuts = response.shortcuts || [];
        shortcuts.forEach(item => {
            primaryShortcuts[item.key] = item;
        });
        console.log('primary:', primaryShortcuts);
    }).catch(error => {
        console.log(error);
    });

    client.getSecondaryShortcuts().then(response => {
        let shortcuts = response.shortcuts || [];
        Object.keys(shortcuts).forEach(key => {
            if (shortcuts.hasOwnProperty(key)) {
                secondaryShortcuts[key] = shortcuts[key]
            }
        });
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
                '19': 'images/icon.png'
            }
        } : {
            path: {
                '19': 'images/icon16.png'
            }
        };
    chrome.browserAction.setIcon(icon);
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
                console.log('request key value:', value);
                sendResponse(value.url);

                client.increaseShortcutOpenTimes(value.id)
                    .then(response => {
                        let shortcut = response.shortcut;
                        primaryShortcuts[shortcut.key] = shortcut;
                    }).catch(error => {
                    console.log(error);
                });
            } else {
                // The shortcut key not bound yet.
                sendResponse(null);
                injector.injectUnboundTipsResources();
            }
            break;
        }
        case message.keys: {
            let keys = Object.keys(primaryShortcuts).filter(key => {
                return keyCodeHelper.isValidKey(key);
            });
            sendResponse(keys);
            break;
        }
        case message.check: {
            // Check url whether bound shortcut.
            common.getCurrentTab(tab => {
                let response = queryBindInfoByUrl(tab.url);
                sendResponse(response);
            });
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
                    primary: true,
                }).then(response => {
                    let shortcut = response.shortcut;
                    primaryShortcuts[shortcut.key] = shortcut;
                    sendResponse("Success");
                    setPopupIcon(true);
                }).catch(error => {
                    console.log(error);
                });
            });
            break;
        }
        case message.optionCheck: {
            // Check whether the domain is valid,can option access.
            sendResponse(secondaryShortcuts[message.domain]);
            break;
        }
        case message.optionRequest: {
            // Access options shortcut key for correct domain.
            //let domain = common.extractDomainName(message.location.hostname);
            var domain = common.extractDomainName(message.location.hostname);
            if (!domain) {
                return;
            }

            if (Object.keys(secondaryShortcuts).length) {
                let items = secondaryShortcuts[domain];
                let url = items[message.key].url;
                if (url) {
                    sendResponse(url);
                } else {
                    //Not exist the key
                }
            } else {
                // Not bound any key for this domain name yet.
            }
            break;
        }
        case message.optionSave: {
            // Save option access bound item data.
            client.bindShortcut(message.key, message.value)
                .then(response => {
                    let shortcut = response.shortcut;
                    let domain = shortcut.domain;
                    if (!secondaryShortcuts.hasOwnProperty(domain)) {
                        secondaryShortcuts[domain] = {}
                    }
                    secondaryShortcuts[domain][message.key] = shortcut;

                    sendResponse(true);
                }).catch(error => {
                console.log(error);
            });
            break;
        }
        case message.optionDelete: {
            break;
        }
        case message.loginSuccessful: {
            auth.signin();
            console.log('login success');
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