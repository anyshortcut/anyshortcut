import common from '../common.js';
/**
 * Current active tab in current window.
 */
let activeTab;
/**
 * A object contain recent tab ids in each window.
 */
let windowRecentTabIds = {};

chrome.tabs.onActivated.addListener(onTabActivated);
chrome.tabs.onDetached.addListener(onTabDetached);
chrome.tabs.onRemoved.addListener(onTabRemoved);
chrome.windows.onFocusChanged.addListener(onWindowFocusChanged);
chrome.windows.onRemoved.addListener(onWindowRemoved);
chrome.commands.onCommand.addListener(onCommandFired);


/**
 * A callback function to detect tab activated change.
 *@param activeInfo looks like this {integer:tabId,integer:windowId}
 */
function onTabActivated(activeInfo) {
    //Get current activated tab
    chrome.tabs.get(activeInfo.tabId, tab => {
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
                    properties["url"] = a.protocol + '\/\/' + parts.join('.');
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
