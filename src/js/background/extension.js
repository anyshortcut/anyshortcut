import common from '../common.js';

chrome.tabs.onActivated.addListener(onTabActivated);
chrome.tabs.onUpdated.addListener(onTabUpdated);

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
window.setPopupIcon = function(bound) {
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