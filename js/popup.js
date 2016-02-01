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

    requestCheckUrlBound(function (bindInfo) {
        //The bindInfo is {"key":key,"value":bindInfo}
        if (bindInfo) {
            $("#bind_div").hide();
            $("#unbind_div").show();

            $("#unbind_guide").show();
            $("#unbind_success").hide();
            $("#bound_shortcut_key").text(bindInfo.key);
            var $boundTime = $('#bound_time');
            $boundTime.show();
            var info = bindInfo.value;
            $boundTime.text(moment(info.time).fromNow());
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
    getCurrentTab(function (tab) {
        const message = {};
        message["check"] = true;
        message["url"] = tab.url;
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

    getCurrentTab(function (tab) {
        renderStatus(tab.url);

        const binding = {};
        const value = {};
        value["url"] = tab.url;
        value["title"] = tab.title;
        value["favicon"] = tab.favIconUrl;
        value["time"] = Date.now();
        binding[inputValue.toUpperCase()] = value;
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
    getCurrentTab(function (tab) {
        const message = {};
        message["delete"] = true;
        message["url"] = tab.url;
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
 * Get the current tab.
 *
 * @param {function(tab)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTab(callback) {
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
        callback(tab);
    });
}
