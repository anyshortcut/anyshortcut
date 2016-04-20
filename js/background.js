import common from './common.js';
import keyCodeHelper from './keycode.js';
import Firebase from 'firebase';

const storage = chrome.storage.local;
let firebase = new Firebase('https://shurl.firebaseio.com');
/**
 * Firebase Authentication
 */
let auth;
/**
 * Firebase user child reference
 */
let userRef;

let keyBindingMaps;
/**
 * Current active tab in current window.
 */
let activeTab;
/**
 * A object contain recent tab ids in each window.
 */
let windowRecentTabIds = {};

// chrome.tabs.onHighlighted.addListener(onTabHighlighted);
chrome.tabs.onActivated.addListener(onTabActivated);
chrome.tabs.onUpdated.addListener(onTabUpdated);
chrome.tabs.onDetached.addListener(onTabDetached);
chrome.tabs.onRemoved.addListener(onTabRemoved);
chrome.windows.onFocusChanged.addListener(onWindowFocusChanged);
chrome.windows.onRemoved.addListener(onWindowRemoved);
chrome.runtime.onMessage.addListener(onMessageReceiver);
chrome.commands.onCommand.addListener(onCommandFired);

firebase.onAuth(authData => {
    auth = authData;

    if (authData) {
        //TODO Sync previous data to server
        userRef = firebase.child('user/' + authData.uid);
        userRef.orderByKey().on("value", snapshot => {
            keyBindingMaps = snapshot.val();
            console.log('onAuth snapshot : ', keyBindingMaps);
        });
    } else {
    }
});

queryAllKeyBindingItems();

/**
 * Query all key binding items from chrome storage for unauthentic user.
 */
function queryAllKeyBindingItems() {
    //TODO add auth listener for user login or logout
    if (auth) {
        //    userRef.child(auth.uid).orderByKey().once("value", snapshot => {
        //        keyBindingMaps = snapshot.val();
        //        console.log('query snapshot : ', keyBindingMaps);
        //    });
    } else {
        storage.get(null, items => {
            keyBindingMaps = items;
        });
    }
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

/**
 * A callback function to detect tab activated change.
 *@param activeInfo looks like this {integer:tabId,integer:windowId}
 */
function onTabActivated(activeInfo) {
    //Get current actived tab
    chrome.tabs.get(activeInfo.tabId, tab => {
        handleOnTabInfoUpdate(tab.url);
        activeTab = tab;

        getRecentTabs(recentTabIds => {
            // Remove previous existed one from recent tab id array.
            let index = recentTabIds.indexOf(activeTab.id);
            if (index !== -1) {
                recentTabIds.splice(index, 1);
            }
            recentTabIds.push(activeTab.id);
        });
    });
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
 * Fired when a tab is detached from a window,
 * for example because it was moved between windows.
 *@param tabId
 *@param detachInfo looks like this {integer:oldWindowId,integer:oldPosition}
 */
function onTabDetached(tabId, detachInfo) {
    let tabIds = windowRecentTabIds[detachInfo.oldWindowId];
    let index = tabIds.indexOf(tabId);
    if (index !== -1) {
        tabIds.splice(index, 1);
    }
}
/**
 * A callback function to detect current tab been removed or closed.
 *@param removeInfo looks like this {integer:windowId,boolean:isWindowClosing}
 */
function onTabRemoved(tabId, removeInfo) {
    getRecentTabs(recentTabIds => {
        // Remove from recent tab id array.
        let index = recentTabIds.indexOf(tabId);
        if (index !== -1) {
            recentTabIds.splice(index, 1);
        }
    });
}

/**
 * Fired when the currently focused window changes.
 * Will be chrome.windows.WINDOW_ID_NONE if all chrome windows have lost focus.
 *@param windowId  ID of the newly focused window.
 */
function onWindowFocusChanged(windowId) {
    if (chrome.windows.WINDOW_ID_NONE === windowId) {
        return;
    }

    //Get new active tab when window focuse changed.
    common.getCurrentTab(tab => {
        activeTab = tab;
    });
}

/**
 * A callback function to detect current window been removed or closed.
 *@param windowId ID of the removed window.
 */
function onWindowRemoved(windowId) {
    delete windowRecentTabIds[windowId];
}

function onMessageReceiver(message, sender, sendResponse) {
    switch (true) {
        case message.request:
        {
            //storage.get(key, items => {
            //    //item value would be {},if not exist the key.
            //    //Besure to check item value is empty.
            //    if (Object.keys(items).length) {
            //        console.log(items);
            //        let value = items[key];
            //        sendResponse(value.url);
            //    } else {
            //        // The shortcut key not bound yet.
            //        sendResponse(null);
            //        injectUnboundTipsResources();
            //    }
            //});

            //If message exist key 'request', represent the message from content script.
            let key = message.key;
            if (keyBindingMaps.hasOwnProperty(key)) {
                let value = keyBindingMaps[key];
                console.log('request key value:', value);
                sendResponse(value.url);

                // Increase the shortcut open times.
                if (auth) {
                    userRef.child(key + '/times').transaction(times => {
                        return times + 1;
                    });
                }
            } else {
                // The shortcut key not bound yet.
                sendResponse(null);
                injectUnboundTipsResources();
            }
            break;
        }
        case message.keys:
        {
            let keys = Object.keys(keyBindingMaps).filter(key => {
                return keyCodeHelper.isValidKey(key);
            });
            sendResponse(keys);
            break;
        }
        case message.check:
        {
            // Check url whether bound shortcut.
            // see popup.js requestCheckUrlBound() method.
            let response = queryBindInfoByUrl(message.url);
            sendResponse(response);
            break;
        }
        case message.delete:
        {
            // Delete the url shortcut.
            if (auth) {
                userRef.child(message.key).remove(error => {
                    if (error) {
                        //Failed
                        sendResponse(false);
                    } else {
                        sendResponse(true);
                        setPopupIcon(false);

                    }
                });
            } else {
                let key = queryShortcutKeyByUrl(message.url);
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
            }
            break;
        }
        case message.save:
        {
            //Save shortcut item to storage.
            //  */user/user_id/A/[url,title,favicon,times]
            //  */user/user_id/github.com/A/[[url,title,favicon,times]]
            if (auth) {
                userRef.child(message.key).set(message.data, error => {
                    if (error) {
                        console.log('Synchronization failed');
                    } else {
                        sendResponse("Success");
                        setPopupIcon(true);
                        console.log('Synchronization succeeded');
                    }
                });
            } else {
                storage.set(message.data, () => {
                    sendResponse("Success");
                    setPopupIcon(true);
                    //Update keyBindingMaps if new shortcut bound.
                    queryAllKeyBindingItems();
                });
            }
            break;
        }
        case message.optionCheck:
        {
            // Check whether the domain is valid,can option access.
            //let domain = message.domain;
            sendResponse(keyBindingMaps[message.domain]);
            break;
        }
        case message.optionRequest:
        {
            // Access options shortcut key for correct domain.
            //FIXME:Module build failed: TypeError: background.js: Property body of LabeledStatement expected node
            // to be of a type ["Statement"] but instead got null
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
        case message.optionSave:
        {
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
        case message.optionDelete:
        {
            break;
        }
        default:
        {
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

function onCommandFired(command) {
    if (command === "toggle_recent_tab") {
        getRecentTabs(recentTabIds => {
            toggleToRecentTab(recentTabIds);
        });
    } else if (command === "jump_to_home") {
        //TrickTips: Navigate to current tab href origin url or domain url.
        common.getCurrentTab(tab => {
            if (tab.url) {
                let a = document.createElement('a');
                a.href = tab.url;
                if (['http:', "https:"].indexOf(a.protocol) === -1) {
                    return;
                }

                let properties = {};
                //Pathname default is '/',search default is ''
                if (a.search !== '' || a.hash !== '') {
                    properties['url'] = a.origin + a.pathname;
                } else if (a.pathname !== '/') {
                    //Navigate to origin url
                    properties["url"] = a.origin;
                } else {
                    //Navigate to domain url
                    let parts = a.hostname.split('.');
                    if (parts.length >= 3) {
                        parts.splice(0, parts.length - 2, 'www');
                    }
                    let domain = a.protocol + '\/\/' + parts.join('.');
                    properties["url"] = domain;
                }
                //Cleanup for garbage collection
                a = null;
                chrome.tabs.update(tab.id, properties);
            }
        });
    }
}

function initializeWindowRecentTabs(windowId, callback) {
    // Initialize empty recent tab array for new window.
    let tabIds = [];
    windowRecentTabIds[windowId] = tabIds;
    callback && callback(tabIds)
}

/**
 * Get current window
 * @param callback  function looks like this: function(window){}
 */
function getCurrentWindow(callback) {
    chrome.windows.getCurrent(window => {
        callback(window);
    });
}

/**
 * Get recent tabs of current window.
 * @param callback  function looks like this: function(recentTabIds){},
 *                  Note:recentTabIds would be empty array.
 */
function getRecentTabs(callback) {
    getCurrentWindow(window => {
        let key = window.id.toString();
        let recentTabIds = windowRecentTabIds[key];
        if (recentTabIds) {
            callback && callback(recentTabIds);
        } else {
            //Not exist,initialize the new window recent tabs data then make callback.
            initializeWindowRecentTabs(key, callback);
        }
    });
}

/**
 * Toggle recent two tabs.
 * @param recentTabIds  recent tab id array.
 */
function toggleToRecentTab(recentTabIds) {
    let nextTabId;
    let lastIndex = recentTabIds.length - 1;
    for (let i = lastIndex; i >= 0; i--) {
        nextTabId = recentTabIds[i];
        if (nextTabId !== activeTab.id) {
            // Swap last two elements position.
            let lastTabId = recentTabIds[lastIndex];
            recentTabIds[lastIndex] = recentTabIds[lastIndex - 1];
            recentTabIds[lastIndex - 1] = lastTabId;
            break;
        }
    }

    chrome.tabs.update(nextTabId, {
        active: true
    }, () => {
        // Invalid tab, try next one
        if (chrome.runtime.lastError && recentTabIds.length) {
            console.warn(chrome.runtime.lastError);
            toggleToRecentTab(recentTabIds);
        }
    });
}
