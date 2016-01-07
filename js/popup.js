var shortcutKeyInput;
var shortcutKeyCode;

//Add click event handler for bind shortcut button after the window was loaded.
window.addEventListener("load", function(initialized) {
    shortcutKeyInput = document.getElementById("shortcut_key");
    shortcutKeyInput.addEventListener("keyup", onShortcutKeyUp, false);

    document.getElementById("bind_shortcut_button").addEventListener("click", handleShortcutBinding);
});

/**
 * Bind shortcut with current actived tab url.
 */
function handleShortcutBinding() {
    if (!shortcutKeyInput.value || shortcutKeyInput.value == "") {
        renderStatus("Please specify a shortcut key!")
        return;
    }

    getCurrentTabUrl(function(url) {
        renderStatus(url);

        var key = shortcutKeyInput.value.toUpperCase();
        var binding = {};
        var value = {};
        value.key = key;
        value.url = url;
        binding[shortcutKeyCode] = value;
        chrome.runtime.sendMessage(binding, function(response) {
            if (chrome.runtime.lastError) {
                alert("error");
            }

            console.log(response);
            renderStatus(response);
        });

    });
}

function onShortcutKeyUp(e) {
    e = keyCodeHelper.ensureWindowEvent(e);

    if (!shortcutKeyInput.value && keyCodeHelper.isValidKeyCode(e.keyCode)) {
        //TODO if event key code in valid?
        shortcutKeyCode = e.keyCode;
        console.log("shortcutKeyCode:", shortcutKeyCode);
    }
}

/**
 * Render status div content text in popup.html.
 */
function renderStatus(statusText) {
    document.getElementById('status').textContent = statusText;
}

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
    // Query filter to be passed to chrome.tabs.query - see
    // https://developer.chrome.com/extensions/tabs#method-query
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, function(tabs) {
        // chrome.tabs.query invokes the callback with a list of tabs that match the
        // query. When the popup is opened, there is certainly a window and at least
        // one tab, so we can safely assume that |tabs| is a non-empty array.
        // A window can only have one active tab at a time, so the array consists of
        // exactly one tab.
        var tab = tabs[0];

        // A tab is a plain object that provides information about the tab.
        // See https://developer.chrome.com/extensions/tabs#type-Tab
        var url = tab.url;

        // tab.url is only available if the "activeTab" permission is declared.
        // If you want to see the URL of other tabs (e.g. after removing active:true
        // from |queryInfo|), then the "tabs" permission is required to see their
        // "url" properties.
        console.assert(typeof url == 'string', 'tab.url should be a string');

        callback(url);
    });

    // Most methods of the Chrome extension APIs are asynchronous. This means that
    // you CANNOT do something like this:
    //
    // var url;
    // chrome.tabs.query(queryInfo, function(tabs) {
    //   url = tabs[0].url;
    // });
    // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

// chrome.runtime.sendMessage("Hello",function(response){
//     document.write(response);
// });
chrome.runtime.onMessage.addListener(function(message, sender, callback) {
    // document.write(response);
    console.log("chrome.runtime.onMessage.", message);
});
