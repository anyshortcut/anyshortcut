//TODO storage tab extras info,such as favicon url,page title.
//TODO use command api to detect a gloab chrome shortcut then show a input to navigation url
/**
 * Current input shortcut key element.
 */
var $shortcutKeyInput;
/**
 * Current input shortcut key code.
 */
var shortcutKeyCode;

//Add click event handler for bind shortcut button after the window was loaded.
$(function () {
    $shortcutKeyInput = $("#shortcut_key");
    $shortcutKeyInput.on("input", onShortcutKeyInput);

    $("#bind_shortcut_button").click(handleShortcutBinding);
    $("#unbind_shortcut_button").click(handleShortcutUnbinding);

    requestCheckUrlBound(function (response) {
        if (response.result) {
            $("#bind_div").hide();
            $("#unbind_div").show();

            $("#unbind_guide").show();
            $("#unbind_success").hide();
            $("#bound_shortcut_key").text(response.key);
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
 * @param checkCallback(response {result:boolean,key:string}) the check callback function.
 */
function requestCheckUrlBound(checkCallback) {
    getCurrentTabUrl(function (url) {
        const message = {};
        message["check"] = true;
        message["url"] = url;
        chrome.runtime.sendMessage(message, checkCallback);
    });
}

/**
 * Bind shortcut with current actived tab url.
 */
function handleShortcutBinding() {
    const inputValue = $shortcutKeyInput.val();
    if (!inputValue || inputValue == "") {
        renderStatus("Please specify a shortcut key!");
        return;
    }

    getCurrentTabUrl(function (url) {
        renderStatus(url);

        const binding = {};
        binding[inputValue.toUpperCase()] = url;
        chrome.runtime.sendMessage(binding, function (response) {
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
    getCurrentTabUrl(function (url) {
        const message = {};
        message["delete"] = true;
        message["url"] = url;
        chrome.runtime.sendMessage(message, function (result) {
            if (result) {
                $("#unbind_guide").hide();
                $("#unbind_success").show();
            }
        });
    });
}

function onShortcutKeyInput(e) {
    //Be sure convert to uppercase,because oninput event occur before uppercase text-transform.
    const keyCodeChar = $shortcutKeyInput.val().toUpperCase();
    const keyCode = keyCodeChar.charCodeAt();
    if (keyCodeHelper.isValidKeyCode(keyCode)) {
        const key = String.fromCharCode(keyCode);
        const message = {};
        message["key"] = key;
        message["validate"] = true;
        chrome.runtime.sendMessage(message, function (response) {
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
    const queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, function (tabs) {
        // chrome.tabs.query invokes the callback with a list of tabs that match the
        // query. When the popup is opened, there is certainly a window and at least
        // one tab, so we can safely assume that |tabs| is a non-empty array.
        // A window can only have one active tab at a time, so the array consists of
        // exactly one tab.
        const tab = tabs[0];

        // A tab is a plain object that provides information about the tab.
        // See https://developer.chrome.com/extensions/tabs#type-Tab
        const url = tab.url;

        // tab.url is only available if the "activeTab" permission is declared.
        // If you want to see the URL of other tabs (e.g. after removing active:true
        // from |queryInfo|), then the "tabs" permission is required to see their
        // "url" properties.
        console.assert(typeof url == 'string', 'tab.url should be a string');

        callback(url);
    });
}
