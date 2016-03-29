import common from './common.js';
import keyCodeHelper from './keycode.js';
import Vue from 'vue';
import moment from 'moment';

import Keyboard from '../component/Keyboard.vue';

/**
 * Current active tab.
 */
var activeTab;

Vue.config.debug = true;

window.onload = function() {
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
    /**
     * Initialize Vue Object instance.
     */
    var vm = new Vue({
        el: 'body',
        data: {
            bound: false, // A flag indicate origin bound.
            key: '', // Shortcut key for origin bound and option bound.
            value: {}, // Origin bound value.
            keyTips: '',
            boundTips: '',// Origin bound tips.
            boundKeys: [],// All bound keys, for keyboard component usage.
            option: { // A option access object.
                bound: false,
                domain: '', // Current active tab url domain name.
                comment: '', // Option item comment.
                support: false, // Current active tab url whether support.
                /**
                 * The all bound shortcut of the domain name.
                 * each item looks like this: {key :{url:string,title:string,time:long}}
                 */
                items: null
            }
        },
        components: {
            Keyboard
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
                if (!key || key === "") {
                    vm.keyTips = "Please specify a shortcut key!";
                    return;
                }
                // else if (!this.keyIsValid) {
                //     vm.keyTips="shortcut key is invalid!";
                //     return;
                // }

                var binding = {};
                var value = {};
                value["url"] = activeTab.url;
                value["title"] = activeTab.title;
                value["favicon"] = activeTab.favIconUrl;
                value["time"] = Date.now();
                binding[key] = value;

                var message = {};
                message['save'] = true;
                message['data'] = binding;
                chrome.runtime.sendMessage(message, response => {
                    if (chrome.runtime.lastError) {
                        console.log("error");
                    }
                    vm.bound = true;
                    vm.boundTips = 'Great job!you have bound a shortcut for this url!';
                });
            },
            handleShortcutUnbinding: function() {
                var message = {};
                message["delete"] = true;
                message["url"] = activeTab.url;
                chrome.runtime.sendMessage(message, result => {
                    if (result) {
                        vm.bound = false;
                        vm.key = '';
                        vm.value = {};

                        vm.boundTips = 'Delete Success!';
                    }
                });
            },
            handleOptionShortcutBinding: function() {
                if (!vm.key || vm.key === '') {
                    vm.keyTips = "Please specify a shortcut key!";
                    return;
                }

                var message = {};
                var value = {};

                var a = document.createElement('a');
                a.href = activeTab.url;
                var domainName = common.extractDomainName(a.hostname);
                message['domain'] = domainName;
                value['url'] = activeTab.url;
                value['title'] = activeTab.title;
                value['comment'] = vm.option.comment;
                value['time'] = Date.now();
                message['key'] = vm.key;
                message['value'] = value;
                message['optionSave'] = true;

                chrome.runtime.sendMessage(message, result => {
                    if (result) {
                        //vm.option.bound = true;
                        queryOptionItems(domainName)
                    }
                });
            }
        },
        created: function() {
            common.getCurrentTab(tab => {
                activeTab = tab;
                let url = activeTab.url;

                let message = {};
                message["check"] = true;
                message["url"] = url;
                // Request check current tab url was bound in background.js
                chrome.runtime.sendMessage(message, bindInfo => {
                    // bind info. {"key":key,"value":value}
                    //TODO How to check javascript object null or undefined properly?
                    if (bindInfo) {
                        vm.bound = true;
                        vm.key = bindInfo.key;
                        vm.value = bindInfo.value;
                    }
                });

                // Check current domain name whether can option access.
                let a = document.createElement('a');
                a.href = url;
                let domainName = common.extractDomainName(a.hostname);
                vm.option.support = (domainName !== null);
                vm.option.domain = domainName || a.hostname;
                if (vm.option.support) {
                    queryOptionItems(domainName);
                }
            });

            chrome.runtime.sendMessage({keys: true}, keys => {
                this.boundKeys = keys;
            });
        }
    });

    /**
     *Query option access item data by domain name.
     * @param domainName
     */
    function queryOptionItems(domainName) {
        var message = {};
        message.domain = domainName;
        message.optionCheck = true;
        chrome.runtime.sendMessage(message, items => {
            vm.option.items = items;
            var url = activeTab.url;
            for (var key in items) {
                // Simply checks to see if this is a property specific to this class,
                // and not one inherited from the base class.
                if (items.hasOwnProperty(key)) {
                    var item = items[key];
                    if (common.isUrlEquivalent(item.url, url)) {
                        vm.key = key;
                        vm.option.bound = true;
                        break;
                    }
                }
            }
        });
    }
};

//document.addEventListener('load', monitorKeyUp, false);

