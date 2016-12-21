import injector from './injector.js';
import common from "../common.js";
import keyCodeHelper from "../keycode.js";
import {origin} from "../api/client.js";

const storage = chrome.storage.local;

let keyBindingMaps;
chrome.tabs.onActivated.addListener(onTabActivated);
chrome.tabs.onUpdated.addListener(onTabUpdated);
chrome.runtime.onMessage.addListener(onMessageReceiver);

queryAllKeyBindingItems();

/**
 * Query all key binding items from chrome storage for unauthentic user.
 */
function queryAllKeyBindingItems() {
    //TODO add api listener for user login or logout
    storage.get(null, items => {
        keyBindingMaps = items;
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
    for (let key in keyBindingMaps) {
        if (key.length === 1 && keyBindingMaps.hasOwnProperty(key)) {
            let info = keyBindingMaps[key];
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
            if (keyBindingMaps.hasOwnProperty(key)) {
                let value = keyBindingMaps[key];
                console.log('request key value:', value);
                sendResponse(value.url);

                origin.increaseShortcutOpenTimes(value.id)
                    .then(response => {
                        let shortcut = response.shortcut;
                        let bind = {};
                        bind[shortcut.key] = shortcut;
                        storage.set(bind, () => {
                            //Update keyBindingMaps.
                            queryAllKeyBindingItems();
                        });
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
            let keys = Object.keys(keyBindingMaps).filter(key => {
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
            let shortcut = keyBindingMaps[message.key];
            origin.unbindShortcut(shortcut.id)
                .then(response => {
                    storage.remove(message.key, () => {
                        //Update keyBindingMaps if old shortcut unbound.
                        queryAllKeyBindingItems();
                        sendResponse(true);
                        setPopupIcon(false);
                    });
                }).catch(error => {
                console.log(error);
                sendResponse(false);
            });
            break;
        }
        case message.save: {
            //Save shortcut item to storage.
            common.getCurrentTab(tab => {
                origin.bindShortcut(message.key, {
                    url: tab.url,
                    title: tab.title,
                    favicon: tab.favIconUrl,
                }).then(response => {
                    let shortcut = response.shortcut;
                    let bind = {};
                    bind[shortcut.key] = shortcut;
                    storage.set(bind, () => {
                        sendResponse("Success");
                        setPopupIcon(true);
                        //Update keyBindingMaps if new shortcut bound.
                        queryAllKeyBindingItems();
                    });
                }).catch(error => {
                    console.log(error);
                });
            });
            break;
        }
        case message.optionCheck: {
            // Check whether the domain is valid,can option access.
            //let domain = message.domain;
            sendResponse(keyBindingMaps[message.domain]);
            break;
        }
        case message.optionRequest: {
            // Access options shortcut key for correct domain.
            //let domain = common.extractDomainName(message.location.hostname);
            var domain = common.extractDomainName(message.location.hostname);
            if (!domain) {
                return;
            }

            storage.get(domain, result => {
                if (Object.keys(result).length) {
                    let items = result[domain];
                    let url = items[message.key].url;
                    if (url) {
                        sendResponse(url);
                    } else {
                        //Not exist the key
                    }
                } else {
                    // Not bound any key for this domain name yet.
                }
            });
            break;
        }
        case message.optionSave: {
            // Save option access bound item data.
            let key = message.domain;
            storage.get(key, result => {
                if (!Object.keys(result).length) {
                    result[key] = {};
                }
                let item = result[key];
                item[message.key] = message.value;

                storage.set(result, () => {
                    sendResponse(true);
                    //Update keyBindingMaps if new option access shortcut bound.
                    queryAllKeyBindingItems();
                });
            });
            break;
        }
        case message.optionDelete: {
            break;
        }
        case message.refresh: {
            queryAllKeyBindingItems();
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