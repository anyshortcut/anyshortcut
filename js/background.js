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
 *@Deprecated
 *
 * Fired when an app or extension has been enabled.
 * @param callback The callback parameter should be a function that looks like this:
 *                  function( ExtensionInfo info) {...};
 */
function onExtensionEnable(callback) {}

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
            // Filter already contained tab id.
            // recentTabIds = recentTabIds.filter(tabId => {
            //     return tabId !== activeTab.id;
            // });
            // Remove from recent tab id array.
            var index = recentTabIds.indexOf(activeTab.id);
            if (index !== -1) {
                recentTabIds.splice(index, 1);
            }
            recentTabIds.push(activeTab.id);
            // windowRecentTabIds[chrome.windows.WINDOW_ID_CURRENT] = recentTabIds;
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
    activeTab = tab;
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
 * A callback function to detect current window been removed or closed.
 *@param windowId ID of the removed window.
 */
function onWindowRemoved(windowId) {
    console.log("windowId:", windowId, "removed...");
    delete windowRecentTabIds[windowId];
}

/**
 * Fired when a window is created.
 * @param window Details of the window that was created.
 */
// function onWindowCreated(window) {
//     // Initialize window recent tabs empty array when window created.
//     var key = window.id.toString();
//     if (!windowRecentTabIds[key]) {
//         windowRecentTabIds[key] = [];
//     }
// }

function onMessageReceiver(message, sender, sendResponse) {
    //If message exist key 'request', represent the message from content script.
    if (message.request) {
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
                injectUnboundTipsResources();
            }
        });
    }
    //if message exist key 'validate',represent the message from popup.js
    //for validate the shortcut whether already bound a url.
    else if (message.validate) {
        storage.get(message.key, item => {
            //item value would be {},if not exist the key.
            //Be sure to check item value is empty.
            const response = {};
            //The key is valid if query result is empty.
            response["valid"] = Object.keys(item).length == 0;
            response["data"] = item;
            sendResponse(response);
        });
    }
    // Check url whether bound shortcut.
    else if (message.check) {
        const response = queryBindInfoByUrl(message.url);
        sendResponse(response);
    }
    // Delete the url shortcut.
    else if (message.delete) {
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
    }
    //Save shortcut item to storage.
    else {
        console.log("chrome.runtime.onMessage.", message);
        storage.set(message, () => {
            console.log("storage success");
            sendResponse("Success");
            setPopupIcon(true);
            //Update keyBindingMaps if new shortcut bound.
            queryAllKeyBindingItems();
        });
    }
    //Must return true otherwise sendResponse() not working.
    //More detail see official documentations [chrome.runtime.onMessage()].
    return true;
}

/**
 * Inject unbound tips javascript and css resources.
 */
function injectUnboundTipsResources() {
    injectResources(['css/inject-tips.css', 'js/inject-unbound-tips.js'])
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

/**
 * An on command method which jump to current active tab url home page.
 */
function onCommandJumpToHome() {
    //TrickTips: Navigate to current tab href origin url or domain url.
    var a = document.createElement('a');
    a.href = activeTab.url;
    var properties = {};
    if (a.pathname !== '/') {
        //Navigate to origin url
        properties["url"] = a.origin;
    } else {
        //Navigate to domain url
        const parts = a.origin.split('.');
        parts.shift();
        const domain = a.protocol + '\/\/' + parts.join('.');
        properties["url"] = domain;
    }
    chrome.tabs.update(activeTab.id, properties);
}

/**
 * An on command method which toggle recent tabs.
 */
function onCommandToggleRecentTabs() {
    getRecentTabs(recentTabIds => {
        // console.log("recent tabs:", JSON.stringify(recentTabIds));
        switchToRecentTab(recentTabIds);
    });
}

function onCommandFired(command) {
    if (command == "toggle_recent_tab") {
        onCommandToggleRecentTabs();
    } else if (command === "jump_to_home") {
        onCommandJumpToHome();
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

function switchToRecentTab(recentTabIds) {
    var nextTabId;
    while (recentTabIds.length) {
        nextTabId = recentTabIds.pop();
        if (nextTabId != activeTab.id) {
            break;
        }
    }

    chrome.tabs.update(nextTabId, {
        active: true
    }, () => {
        // Invalid tab, try next one
        if (chrome.runtime.lastError && recentTabIds.length) {
            switchToRecentTab(recentTabIds);
        }
    });
}

queryAllKeyBindingItems();
// chrome.management.onEnabled.addListener(onExtensionEnable);
// chrome.tabs.onHighlighted.addListener(onTabHighlighted);
chrome.tabs.onActivated.addListener(onTabActivated);
chrome.tabs.onUpdated.addListener(onTabUpdated);
chrome.tabs.onRemoved.addListener(onTabRemoved);

// chrome.windows.onCreated.addListener(onWindowCreated);
chrome.windows.onRemoved.addListener(onWindowRemoved);
chrome.runtime.onMessage.addListener(onMessageReceiver);

chrome.commands.onCommand.addListener(onCommandFired);
