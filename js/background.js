const storage = chrome.storage.local;
var keyBindingMaps;
/**
 * Current active tab in current window.
 */
var activeTab;
/**
 * A object contain recent tab ids in each window.
 */
var windowRecentTabIds = {};

// chrome.tabs.onHighlighted.addListener(onTabHighlighted);
chrome.tabs.onActivated.addListener(onTabActivated);
chrome.tabs.onUpdated.addListener(onTabUpdated);
chrome.tabs.onDetached.addListener(onTabDetached);
chrome.tabs.onRemoved.addListener(onTabRemoved);
chrome.windows.onFocusChanged.addListener(onWindowFocusChanged);
chrome.windows.onRemoved.addListener(onWindowRemoved);
chrome.runtime.onMessage.addListener(onMessageReceiver);
chrome.commands.onCommand.addListener(onCommandFired);

queryAllKeyBindingItems();

function queryAllKeyBindingItems() {
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
    var result = queryBindInfoByUrl(url);
    return result ? result.key : null;
}

/**Query the bind info key/value object by url.
 *
 * @param url
 * @returns the bind info. {"key":key,"value":value}
 */
function queryBindInfoByUrl(url) {
    var result = null;
    for (var key in keyBindingMaps) {
        var info = keyBindingMaps[key];
        if (url == info.url) {
            result = {};
            result["key"] = key;
            result["value"] = info;
            return result;
        }
    }
    return result;
}

/**
 * Check current tab url whether bound or not.
 *@param url current tab url
 *@return boolean true if the url was bound,false otherwise
 */
function checkUrlBound(url) {
    return queryShortcutKeyByUrl(url) != null;
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
        console.log(tab);
        handleOnTabInfoUpdate(tab.url);
        activeTab = tab;

        getRecentTabs(recentTabIds => {
            // Remove previous existed one from recent tab id array.
            var index = recentTabIds.indexOf(activeTab.id);
            if (index !== -1) {
                recentTabIds.splice(index, 1);
            }
            recentTabIds.push(activeTab.id);
            console.log("recent tab ids:", recentTabIds);
        });
    });
}

/**
 * A callback function to detect current activated tab updated.
 *@param changeInfo looks like this {string:url,string:status...}
 *@param tab Gives the state of the tab that was updated.
 */
function onTabUpdated(tabId, changeInfo, tab) {
    console.log("tab id:", tabId, " change info:", changeInfo);
    handleOnTabInfoUpdate(tab.url);
}

/**
 * Fired when a tab is detached from a window,
 * for example because it was moved between windows.
 *@param tabId
 *@param detachInfo looks like this {integer:oldWindowId,integer:oldPosition}
 */
function onTabDetached(tabId, detachInfo) {
    var tabIds = windowRecentTabIds[detachInfo.oldWindowId];
    var index = tabIds.indexOf(tabId);
    if (index !== -1) {
        tabIds.splice(index, 1);
    }
}
/**
 * A callback function to detect current tab been removed or closed.
 *@param removeInfo looks like this {integer:windowId,boolean:isWindowClosing}
 */
function onTabRemoved(tabId, removeInfo) {
    console.log("tab id:", tabId, "removed...");
    getRecentTabs(recentTabIds => {
        // Remove from recent tab id array.
        var index = recentTabIds.indexOf(tabId);
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
    console.log("windowId:", windowId, "focuse changed...");
    if (chrome.windows.WINDOW_ID_NONE === windowId) {
        return;
    }

    //Get new active tab when window focuse changed.
    getCurrentTab(tab => {
        activeTab = tab;
    });
}

/**
 * A callback function to detect current window been removed or closed.
 *@param windowId ID of the removed window.
 */
function onWindowRemoved(windowId) {
    console.log("windowId:", windowId, "removed...");
    delete windowRecentTabIds[windowId];
}

function onMessageReceiver(message, sender, sendResponse) {
    switch (true) {
        case message.request:
            //If message exist key 'request', represent the message from content script.
            var key = message.key;
            storage.get(key, items => {
                if (chrome.runtime.lastError) {
                    console.log("Got a error...");
                    return;
                }
                //item value would be {},if not exist the key.
                //Besure to check item value is empty.
                if (Object.keys(items).length) {
                    console.log(items);
                    var value = items[key];
                    sendResponse(value.url);
                } else {
                    // The shortcut key not bound yet.
                    sendResponse(null);
                    injectUnboundTipsResources();
                }
            });
            break;

        case message.option:
        // Access options shortcut key for correct domain.
            console.log(message.location);
            break;

        case message.validate:
            //if message exist key 'validate',represent the message from popup.js
            //for validate the shortcut whether already bound a url.
            storage.get(message.key, item => {
                //item value would be {},if not exist the key.
                //Be sure to check item value is empty.
                var response = {};
                //The key is valid if query result is empty.
                response["valid"] = Object.keys(item).length == 0;
                response["data"] = item;
                sendResponse(response);
            });
            break;
        case message.check:
            // Check url whether bound shortcut.
            var response = queryBindInfoByUrl(message.url);
            sendResponse(response);
            break;

        case message.delete:
            // Delete the url shortcut.
            var key = queryShortcutKeyByUrl(message.url);
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

            //Save shortcut item to storage.
        default:
            storage.set(message, () => {
                console.log("storage success");
                sendResponse("Success");
                setPopupIcon(true);
                //Update keyBindingMaps if new shortcut bound.
                queryAllKeyBindingItems();
            });
            break;
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
            console.log('Eroor occur {$error}');
        });
}

/**
 * Injects resources provided as paths into active tab in chrome
 * @param files {string[]}
 * @returns {Promise}
 */
function injectResources(files) {
    var getFileExtension = /(?:\.([^.]+))?$/;

    //helper function that returns appropriate chrome.tabs function to load resource
    var loadFunctionForExtension = (ext) => {
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
            var ext = getFileExtension.exec(resource)[1];
            var injectFunction = loadFunctionForExtension(ext);

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
    if (command == "toggle_recent_tab") {
        getRecentTabs(recentTabIds => {
            toggleToRecentTab(recentTabIds);
        });
    } else if (command === "jump_to_home") {
        //TrickTips: Navigate to current tab href origin url or domain url.
        getCurrentTab(tab => {
            if (tab.url) {
                var a = document.createElement('a');
                a.href = tab.url;
                if (['http:', "https:"].indexOf(a.protocol) === -1) {
                    return;
                }

                var properties = {};
                //Pathname default is '/',search default is ''
                if (a.search !== '' || a.hash !== '') {
                    properties['url'] = a.origin + a.pathname;
                } else if (a.pathname !== '/') {
                    //Navigate to origin url
                    properties["url"] = a.origin;
                } else {
                    //Navigate to domain url
                    var parts = a.hostname.split('.');
                    if (parts.length >= 3) {
                        parts.splice(0, parts.length - 2, 'www');
                    }
                    console.log("hostname split parts:", parts);
                    var domain = a.protocol + '\/\/' + parts.join('.');
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
    var tabIds = [];
    windowRecentTabIds[windowId] = tabIds;
    callback && callback(tabIds)
}

/**
 * Get current window
 * @param callback  function looks like this: function(window){}
 */
function getCurrentWindow(callback) {
    chrome.windows.getCurrent(window => {
        console.log("current window id is:", window.id);
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
        var key = window.id.toString();
        var recentTabIds = windowRecentTabIds[key];
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
    var nextTabId;
    var lastIndex = recentTabIds.length - 1;
    for (var i = lastIndex; i >= 0; i--) {
        nextTabId = recentTabIds[i];
        if (nextTabId !== activeTab.id) {
            // Swap last two elements position.
            var lastTabId = recentTabIds[lastIndex];
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
