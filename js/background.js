const storage = chrome.storage.local;
var keyBindingMaps;

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
    setPopupIcon(checkUrlBound(url));
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
