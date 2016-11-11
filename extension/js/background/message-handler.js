import common from '../common.js';
import keyCodeHelper from '../keycode.js';

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
    //TODO add auth listener for user login or logout
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
        case message.tabUpdated: {
            //Handle on tab info updated
            let url = message.url;
            console.log('tab updated:', url);
            setPopupIcon(url ? checkUrlBound(url) : false);
            break;
        }
        case message.request: {
            //If message exist key 'request', represent the message from content script.
            let key = message.key;
            if (keyBindingMaps.hasOwnProperty(key)) {
                let value = keyBindingMaps[key];
                console.log('request key value:', value);
                sendResponse(value.url);

                //TODO Increase the shortcut open times.
            } else {
                // The shortcut key not bound yet.
                sendResponse(null);
                injectUnboundTipsResources();
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
            common.getCurrentTab(tab => {
                let key = queryShortcutKeyByUrl(tab.url);
                if (key) {
                    storage.remove(key, () => {
                        sendResponse(true);
                        setPopupIcon(false);
                        //Update keyBindingMaps if old shortcut unbound.
                        queryAllKeyBindingItems();
                    });
                } else {
                    //Failed
                    sendResponse(false);
                }
            });
            break;
        }
        case message.save: {
            //Save shortcut item to storage.
            common.getCurrentTab(tab => {
                let shortcut = {};
                shortcut[message.key] = {
                    url: tab.url,
                    title: tab.title,
                    favicon: tab.favIconUrl,
                    createdTime: Date.now(),
                    openTimes: 0
                };

                storage.set(shortcut, () => {
                    sendResponse("Success");
                    setPopupIcon(true);
                    //Update keyBindingMaps if new shortcut bound.
                    queryAllKeyBindingItems();
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
        default: {
            break;
        }
    }
    //Must return true otherwise sendResponse() not working.
    //More detail see official documentations [chrome.runtime.onMessage()].
    return true;
}

/**
 * Inject unbound tips javascript and css resources.
 */
function injectUnboundTipsResources() {
    injectResources(['js/inject-unbound-tips.js'])
        .then(() => {
            console.log('inject success!');
        }).catch(error => {
        console.log('Eroor occur ${error}');
    });
}

/**
 * Injects resources provided as paths into active tab in chrome
 * @param files {string[]}
 * @returns {Promise}
 */
function injectResources(files) {
    let getFileExtension = /(?:\.([^.]+))?$/;

    //helper function that returns appropriate chrome.tabs function to load resource
    let loadFunctionForExtension = (ext) => {
        switch (ext) {
            case 'js':
                return chrome.tabs.executeScript;
            case 'css':
                return chrome.tabs.insertCSS;
            default:
                throw new Error('Unsupported resource type')
        }
    };

    return Promise.all(files.map(resource => {
        new Promise((resolve, reject) => {
            let ext = getFileExtension.exec(resource)[1];
            let injectFunction = loadFunctionForExtension(ext);

            injectFunction(null, {
                file: resource
            }, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    }));
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