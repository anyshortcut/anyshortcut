
var storage = chrome.storage.local;
var keyBindingMaps;

function queryAllKeyBindingItems() {
    storage.get(null, function(items) {
        console.log(items);
        keyBindingMaps = items;
    });
};

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
    //More detail see officail documentations [chrome.runtime.onMessage()].
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

chrome.runtime.onMessage.addListener(onMessageReceiver);
