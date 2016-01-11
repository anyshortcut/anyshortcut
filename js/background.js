//TODO change browser action icon dynamically according to the url shortcut binged or not.

var storage = chrome.storage.local;
var keyBindingMaps;

function queryAllKeyBindingItems() {
    storage.get(null, function(items) {
        keyBindingMaps = items;
    });
};

/**
 * Check current tab url whether bound or not.
 *@param url current tab url
 *@return true if the url was bound,false otherwise
 */
function checkUrlBound(url) {
    //Get properties array of Object.
    keys = Object.keys(keyBindingMaps);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (url == keyBindingMaps[key]) {
            return true;
        }
    }
    return false;
}

/**
 * Set a different popup icon according to current tab url whether bound or not.
 *@param bound whether the current tab url was bound with a shortcut
 */
function setPopupIcon(bound) {
    var icon = bound ? {
        path: {
            '19': 'images/icon.png'
        }
    } : {
        path: {
            '38': 'images/icon16.png'
        }
    };
    chrome.browserAction.setIcon(icon);
}

function handleOnTabInfoUpdate(url) {
    setPopupIcon(checkUrlBound(url));
}

/**
 * A callback function to detect tab activated change.
 *@param activeInfo looks like this {integer:tabId,integer:windowId}
 */
function onTabActivated(activeInfo) {
    //Get current actived tab
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        console.log(tab);
        handleOnTabInfoUpdate(tab.url);
    });
}

/**
 * A callback function to detect current activated tab updated.
 *@param activeInfo looks like this {integer:tabId,integer:windowId}
 */
function onTabUpdated(tabId, changeInfo, tab) {
    console.log("tab id:", tabId, " change info:", changeInfo);
    handleOnTabInfoUpdate(tab.url);
}

function onMessageReceiver(message, sender, sendResponse) {
    //If message exist key 'request', represent message from content script.
    if (message.request) {
        console.log("from content script");
        var key = message.key;
        storage.get(key, function(item) {
            //item value would be {},if not exist the key.
            //Besure to check item value is empty.
            if (chrome.runtime.lastError || !Object.keys(item).length) {
                console.log("Got a error...");
            } else {
                console.log(item);
                sendResponse(item[key]);
            }
        });
    } else {
        console.log("chrome.runtime.onMessage.", message);
        storage.set(message, function() {
            console.log("storage success");
            sendResponse("message");
        });
    }
    //Must return true otherwise sendResponse() not working.
    //More detail see official documentations [chrome.runtime.onMessage()].
    return true;
}

// // Called when the user clicks on the browser action.
// chrome.browserAction.onClicked.addListener(function(tab) {
//     // No tabs or host permissions needed!
//     console.log('Turning ' + tab.url + ' red!');
//
//     // chrome.tabs.executeScript({
//     //   code: 'document.body.style.backgroundColor="red"'
//     // });
// });

queryAllKeyBindingItems();
chrome.tabs.onActivated.addListener(onTabActivated);
chrome.tabs.onUpdated.addListener(onTabUpdated);
chrome.runtime.onMessage.addListener(onMessageReceiver);
