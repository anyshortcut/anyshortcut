//TODO storage tab extras info,such as favicon url,page title.
//TODO use command api to detect a gloab chrome shortcut then show a input to navigation url
/**
 * Current input shortcut key element.
 */
var shortcutKeyInput;
/**
 * Current input shortcut key code.
 */
var shortcutKeyCode;

//Add click event handler for bind shortcut button after the window was loaded.
window.addEventListener("load", function(initialized) {
    shortcutKeyInput = document.getElementById("shortcut_key");
    shortcutKeyInput.addEventListener("input", onShortcutKeyInput, false);

    $("#bind_shortcut_button").on("click", handleShortcutBinding);
    $("#unbind_shortcut_button").on("click", handleShortcutUnbinding);

    requestCheckUrlBound(function(result) {
        if (result) {
            $("#bind_div").hide();
            $("#unbind_div").show();

            $("#unbind_guide").show();
            $("#unbind_success").hide();
        } else {
            $("#bind_div").show();
            $("#unbind_div").hide();

            $("#bind_guide").show();
            $("#bind_success").hide();
        }
    });
});

/**
 * Request check current tab url was bound in background.js
 *
 * @param checkCallback(boolean result) the check callback function.
 *        true if the url already bound,false otherwise
 */
function requestCheckUrlBound(checkCallback) {
    getCurrentTabUrl(function(url) {
        var message = {};
        message["check"] = true;
        message["url"] = url;
        chrome.runtime.sendMessage(message, checkCallback);
    });
}

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

        var binding = {};
        binding[shortcutKeyInput.value.toUpperCase()] = url;
        chrome.runtime.sendMessage(binding, function(response) {
            if (chrome.runtime.lastError) {
                alert("error");
            }

            console.log(response);
            // renderStatus(response);
            $("#bind_guide").hide();
            $("#bind_success").show();
        });

    });
}

function handleShortcutUnbinding() {
    getCurrentTabUrl(function(url) {
        var message = {};
        message["delete"] = true;
        message["url"] = url;
        chrome.runtime.sendMessage(message, function(result) {
            if (result) {
                $("#unbind_guide").hide();
                $("#unbind_success").show();
            }
        });
    });
}

function onShortcutKeyInput(e) {
    e = keyCodeHelper.ensureWindowEvent(e);

    //Besure convert to uppercase,because oninput event occur before uppercase text-transform.
    keyCodeChar = shortcutKeyInput.value.toUpperCase();
    var keyCode = keyCodeChar.charCodeAt();
    console.log("keyCode charCodeAt", shortcutKeyInput.value, keyCode);
    if (keyCodeHelper.isValidKeyCode(keyCode)) {
        var key = String.fromCharCode(keyCode);
        message = {};
        message["key"] = key;
        message["validate"] = true;
        chrome.runtime.sendMessage(message, function(response) {
            if (response.valid) {
                renderStatus("");
            } else {
                renderStatus("invalid shortcut key " + keyCodeChar + keyCode + "\n and the url is " + response["data"][key]);
            }
        });

        shortcutKeyCode = keyCode;
        console.log("shortcutKeyCode:", shortcutKeyCode);
    } else {
        renderStatus("invalid shortcut key ", keyCodeChar, keyCode);
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
}
