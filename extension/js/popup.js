import Vue from "vue";
import moment from 'moment';
import Keyboard from '../component/Keyboard.vue';
import common from "./common.js";
import auth from "./background/auth.js";

window.onload = function() {
    Vue.config.debug = true;

    let vm = new Vue({
        el: 'body',
        data: {
            tab: {},
            bound: false, // A flag indicate origin bound.
            key: '', // Shortcut key for origin bound.
            value: {}, // Origin bound value.
            boundTips: '',// Origin bound tips.
            boundKeys: null,// All bound keys, for keyboard component usage.
            comment: null,
            primary: true,
        },
        computed: {
            authenticated: function() {
                return auth.isAuthenticated();
            }
        },
        components: {
            Keyboard
        },
        filters: {
            //Custom filter to use moment.js format time as fromNow type.
            fromNow: function(time) {
                return moment(time).fromNow();
            }
        },
        methods: {
            loginWithGoogle: function() {
                auth.openAuthPopupWindow();
            },
            handleShortcutBinding: function() {
                chrome.runtime.sendMessage({save: true, key: this.key, comment: this.comment}, response => {
                    this.bound = true;
                    this.boundTips = 'Great job!you have bound a shortcut for this url!';
                });
            },
            handleShortcutUnbinding: function() {
                chrome.runtime.sendMessage({remove: true, key: this.key}, result => {
                    if (result) {
                        this.bound = false;
                        this.key = '';
                        this.value = {};

                        this.boundTips = 'Delete Success!';
                    }
                });
            }
        },
        created: function() {
            common.getCurrentTab(tab => {
                this.tab = tab;
                // Request check current tab url was bound in message-handler.js
                chrome.runtime.sendMessage({check: true}, bindInfo => {
                    // bind info. {"key":key,"value":value}
                    //TODO How to check javascript object null or undefined properly?
                    if (bindInfo) {
                        this.bound = true;
                        this.key = bindInfo.key;
                        this.value = bindInfo.value;
                    }
                });
            });

            chrome.runtime.sendMessage({keys: true}, keys => {
                this.boundKeys = keys ? keys : null;
            });
        }
    });
};