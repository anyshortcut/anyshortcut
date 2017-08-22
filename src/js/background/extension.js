import common from '../common.js';
import auth from '../auth.js';

/**
 * Current active tab in current window.
 */
window.activeTab = null;
/**
 * A object contain recent tab ids in each window.
 */
let windowRecentTabIds = {};

chrome.tabs.onActivated.addListener(onTabActivated);
chrome.tabs.onUpdated.addListener(onTabUpdated);
chrome.tabs.onDetached.addListener(onTabDetached);
chrome.tabs.onRemoved.addListener(onTabRemoved);
chrome.windows.onFocusChanged.addListener(onWindowFocusChanged);
chrome.windows.onRemoved.addListener(onWindowRemoved);
chrome.commands.onCommand.addListener(onCommandFired);

// Get current active tab when initial the extension.
common.getCurrentTab(tab => {
    window.activeTab = tab;
});


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

window.isActiveTabUrlSupported = function() {
    if (window.activeTab && window.activeTab.url) {
        let a = document.createElement('a');
        a.href = window.activeTab.url;
        return ['http:', "https:", "file:"].indexOf(a.protocol) !== -1;
    }
    return true;
};

/**
 * Set a different popup icon according to current tab url whether bound or not.
 *@param bound whether the current tab url was bound with a shortcut
 */
window.setPopupIcon = function(bound) {
    // Only in authenticated stage, then to check the tab url whether supported
    if (auth.isAuthenticated() && !isActiveTabUrlSupported()) {
        // Set a gray unsupported icon
        chrome.browserAction.setIcon({
            path: {
                '16': 'icon/icon32-gray-unsupported.png'
            }
        });
        return;
    }

    const icon = bound ? {
        path: {
            '16': 'icon/icon32.png'
        }
    } : {
        path: {
            '16': 'icon/icon32-gray.png'
        }
    };
    chrome.browserAction.setIcon(icon);
};

function handleOnTabInfoUpdate(url) {
    setPopupIcon(url ? checkUrlBound(url) : false);
}

/**
 * A callback function to detect tab activated change.
 *@param activeInfo looks like this {integer:tabId,integer:windowId}
 */
function onTabActivated(activeInfo) {
    //Get current activated tab
    chrome.tabs.get(activeInfo.tabId, tab => {
        getRecentTabs(recentTabIds => {
            // Remove previous existed one from recent tab id array.
            let index = recentTabIds.indexOf(tab.id);
            if (index !== -1) {
                recentTabIds.splice(index, 1);
            }
            recentTabIds.push(tab.id);
        });

        window.activeTab = tab;

        handleOnTabInfoUpdate(tab.url);
    });
}

/**
 * A callback function to detect current activated tab updated.
 *@param changeInfo looks like this {string:url,string:status...}
 *@param tab Gives the state of the tab that was updated.
 */
function onTabUpdated(tabId, changeInfo, tab) {
    // Update activeTab where tab updated.

    // Only update activeTab info when window.activeTab.id === tab.id
    if (window.activeTab && window.activeTab.id === tab.id) {
        window.activeTab = tab;
    }
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
 *@param tabId
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
        window.activeTab = tab;
    });
}

/**
 * A callback function to detect current window been removed or closed.
 *@param windowId ID of the removed window.
 */
function onWindowRemoved(windowId) {
    delete windowRecentTabIds[windowId];
}

function onCommandFired(command) {
    if (command === "toggle_recent_tab") {
        getRecentTabs(recentTabIds => {
            toggleToRecentTab(recentTabIds);
        });
    } else if (command === "jump_to_home") {
        //TrickTips: Navigate to current tab href origin url or domain url.
        let tab = window.activeTab;
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
                properties["url"] = a.protocol + '\/\/' + parts.join('.');
            }
            //Cleanup for garbage collection
            a = null;
            chrome.tabs.update(tab.id, properties);
        }
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
        if (nextTabId !== window.activeTab.id) {
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
