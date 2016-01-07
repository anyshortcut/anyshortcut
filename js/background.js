console.log("background javascript file");

var storage = chrome.storage.local;
var keyBindingMaps;

function queryAllKeyBindingItems() {
    storage.get(null, function(items) {
        console.log(items);
        keyBindingMaps = items;
    });
};

function setupBindUrlShortcut() {
    // alert("setup_bind_url_shortcut")
    var url = "http://www.geowind.cn"
    window.open(url, "_blank")
}

function onMenuClickHandler(info, tab) {
    if (info.menuItemId == "menu") {
        console.log("onMenuClickHandler");
        setupBindUrlShortcut();
        // alert(JSON.stringify(info));
    }
}

function onMessageReceiver(message, sender, sendResponse) {
    if (message == "key_code") {
        console.log("from content script");
        storage.get(null, function(items) {
            console.log(items);
            keyBindingMaps = items;
            sendResponse(keyBindingMaps);
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

chrome.contextMenus.create({
    "title": "Set keyboard shortcut to launch this website quickly...",
    "type": "normal",
    "contexts": ["page"],
    "id": "menu"
}, function() {
    if (chrome.extension.lastError) {
        console.log("Got expected error: " + chrome.extension.lastError.message);
    }
});


// // Called when the user clicks on the browser action.
// chrome.browserAction.onClicked.addListener(function(tab) {
//     // No tabs or host permissions needed!
//     console.log('Turning ' + tab.url + ' red!');
//
//     // chrome.tabs.executeScript({
//     //   code: 'document.body.style.backgroundColor="red"'
//     // });
// });
chrome.contextMenus.onClicked.addListener(onMenuClickHandler);

chrome.runtime.onMessage.addListener(onMessageReceiver);
