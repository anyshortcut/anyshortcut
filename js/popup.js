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
            boundTips: '',// Origin bound tips.
            boundKeys: [],// All bound keys, for keyboard component usage.
            showKeyboard: false,
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
            handleShortcutBinding: function() {
                let binding = {};
                binding[this.key] = {
                    url: activeTab.url,
                    title: activeTab.title,
                    favicon: activeTab.favIconUrl,
                    time: Date.now()
                };

                chrome.runtime.sendMessage({save: true, data: binding}, response => {
                    vm.bound = true;
                    vm.boundTips = 'Great job!you have bound a shortcut for this url!';
                });
            },
            handleShortcutUnbinding: function() {
                chrome.runtime.sendMessage({delete: true, url: activeTab.url}, result => {
                    if (result) {
                        vm.bound = false;
                        vm.key = '';
                        vm.value = {};

                        vm.boundTips = 'Delete Success!';
                    }
                });
            },
            handleOptionShortcutBinding: function() {
                let a = document.createElement('a');
                a.href = activeTab.url;
                let domainName = common.extractDomainName(a.hostname);

                let value = {
                    url: activeTab.url,
                    title: activeTab.title,
                    comment: vm.option.comment,
                    time: Date.now()
                };
                chrome.runtime.sendMessage({
                    optionSave: true,
                    domain: domainName,
                    key: vm.key,
                    value: value
                }, result => {
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
                // Request check current tab url was bound in background.js
                chrome.runtime.sendMessage({check: true, url: url}, bindInfo => {
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
        chrome.runtime.sendMessage({optionCheck: true, domain: domainName}, items => {
            vm.option.items = items;
            let url = activeTab.url;
            for (let key in items) {
                // Simply checks to see if this is a property specific to this class,
                // and not one inherited from the base class.
                if (items.hasOwnProperty(key)) {
                    let item = items[key];
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

