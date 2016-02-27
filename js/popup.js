$(function() {
    //Custom filter to use moment.js format time as fromNow type.
    Vue.filter('fromNow', time => {
        return moment(time).fromNow();
    });
    //Custom two-way filter to write uppercase value to model.(read way is ignore)
    Vue.filter('uppercaseIt', {
        write: (value, oldValue) => {
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
                return keyCodeHelper.isValidKey(this.key);
            }
        },
        methods: {
            onShortcutKeyInput: function(event) {
                var key = this.key;
                if (this.keyIsValid) {
                    var message = {};
                    message["key"] = key;
                    message["validate"] = true;
                    chrome.runtime.sendMessage(message, response => {
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

                getCurrentTab(tab => {
                    var binding = {};
                    var value = {};
                    value["url"] = tab.url;
                    value["title"] = tab.title;
                    value["favicon"] = tab.favIconUrl;
                    value["time"] = Date.now();
                    binding[key] = value;
                    chrome.runtime.sendMessage(binding, response => {
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
                    chrome.runtime.sendMessage(message, result => {
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
            requestCheckUrlBound(bindInfo => {
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
    getCurrentTab(tab => {
        var message = {};
        message["check"] = true;
        message["url"] = tab.url;
        chrome.runtime.sendMessage(message, response);
    });
}
