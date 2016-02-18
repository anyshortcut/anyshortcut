$(function() {
    //Custom filter to use moment.js format time as fromNow type.
    Vue.filter('fromNow', function(time) {
        return moment(time).fromNow();
    });
    //Custom two-way filter to write uppercase value to model.(read way is ignore)
    Vue.filter('uppercaseIt', {
        write: function(value, oldValue) {
            return value.toUpperCase();
        }
    });

    var vm = new Vue({
        el: 'body',
        data: {
            bound: false,
            key: '',
            value: {},
            keyTips: '',
            boundTips: ''
        },
        computed: {
            keyIsValid: function() {
                return keyCodeHelper.isValidKeyCode(this.key.charCodeAt());
            },
        },
        methods: {
            onShortcutKeyInput: function(event) {
                var key = this.key;
                if (this.keyIsValid) {
                    var message = {};
                    message["key"] = key;
                    message["validate"] = true;
                    chrome.runtime.sendMessage(message, function(response) {
                        if (response.valid) {
                            vm.keyTips = '';
                        } else {
                            vm.keyTips = "invalid shortcut key " + key +
                                JSON.stringify(event) + "\n and the url is \n" +
                                JSON.stringify(response["data"][key]["url"]);
                        }
                    });
                } else {
                    vm.keyTips = "invalid shortcut key " + key + event.keyCode;
                }
            },
            handleShortcutBinding: function() {
                var key = this.key;
                if (!key || key == "") {
                    vm.keyTips = "Please specify a shortcut key!";
                    return;
                }
                // else if (!this.keyIsValid) {
                //     vm.keyTips="shortcut key is invalid!";
                //     return;
                // }

                getCurrentTab(function(tab) {
                    var binding = {};
                    var value = {};
                    value["url"] = tab.url;
                    value["title"] = tab.title;
                    value["favicon"] = tab.favIconUrl;
                    value["time"] = Date.now();
                    binding[key] = value;
                    chrome.runtime.sendMessage(binding, function(response) {
                        if (chrome.runtime.lastError) {
                            console.log("error");
                        }
                        vm.bound = true;
                        vm.boundTips = 'Great job!you have bound a shortcut for this url!';
                    });
                });
            },
            handleShortcutUnbinding: function() {
                getCurrentTab(function(tab) {
                    const message = {};
                    message["delete"] = true;
                    message["url"] = tab.url;
                    chrome.runtime.sendMessage(message, function(result) {
                        if (result) {
                            vm.bound = false;
                            vm.key = '';
                            vm.value = {};

                            vm.boundTips = 'Delete Success!';
                        }
                    });
                });
            }
        },
        created: function() {
            requestCheckUrlBound(function(bindInfo) {
                vm.bound = bindInfo !== null;
                if (vm.bound) {
                    vm.key = bindInfo.key;
                    vm.value = bindInfo.value;
                }
            });
        }
    });
});

/**
 * Request check current tab url was bound in background.js
 *
 * @param response is the function which params is the bind info. {"key":key,"value":value}
 */
function requestCheckUrlBound(response) {
    getCurrentTab(function(tab) {
        const message = {};
        message["check"] = true;
        message["url"] = tab.url;
        chrome.runtime.sendMessage(message, response);
    });
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

    chrome.tabs.query(queryInfo, function(tabs) {
        // chrome.tabs.query invokes the callback with a list of tabs that match the
        // query. When the popup is opened, there is certainly a window and at least
        // one tab, so we can safely assume that |tabs| is a non-empty array.
        // A window can only have one active tab at a time, so the array consists of
        // exactly one tab.
        const tab = tabs[0];
        callback(tab);
    });
}
