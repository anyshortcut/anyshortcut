import Vue from "vue";
import moment from "moment";
import Keyboard from "../component/Keyboard.vue";
import common from "./common.js";
import auth from "./background/auth.js";

window.onload = function() {
    let vm = new Vue({
        el: '#vue',
        data: {
            tab: {},
            bound: false,
            key: '',
            shortcut: {},
            boundTips: '',
            boundKeys: null,// All bound keys, for keyboard component usage.
            comment: null,
            primary: null,
            primaryShortcuts: null,
            secondaryShortcuts: null,
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
        watch: {
            'primary': function() {
                if (this.primary) {
                    this.boundKeys = Object.keys(this.primaryShortcuts || []);
                } else {
                    this.boundKeys = Object.keys(this.secondaryShortcuts || []);
                }
            }
        },
        methods: {
            loginWithGoogle: function() {
                auth.openAuthPopupWindow();
            },
            onKeySelected: function(key) {
                this.key = key;
            },
            handleShortcutBinding: function() {
                if (this.primary) {
                    this.bindPrimaryShortcut();
                } else {
                    this.bindSecondaryShortcut();
                }
            },
            bindPrimaryShortcut: function() {
                chrome.runtime.sendMessage({save: true, key: this.key, comment: this.comment}, result => {
                    if (result) {
                        this.boundTips = 'Great job!you have bound a shortcut for this url!';
                        this.queryPrimaryShortcuts();
                    }
                    else {
                        this.boundTips = 'Ooops!';
                    }
                });
            },
            unbindPrimaryShortcut: function() {
                chrome.runtime.sendMessage({remove: true, key: this.key}, result => {
                    if (result) {
                        this.key = '';
                        this.shortcut = {};
                        this.boundTips = 'Delete Success!';
                        this.queryDomainSecondaryShortcuts();
                    } else {
                        this.boundTips = 'Ooops!';
                    }
                });
            },
            bindSecondaryShortcut: function() {
                chrome.runtime.sendMessage({
                    secondarySave: true,
                    key: this.key,
                    comment: this.comment
                }, result => {
                    if (result) {
                        this.queryDomainSecondaryShortcuts();
                    } else {
                        this.boundTips = 'Ooops!';
                    }
                });
            },
            queryPrimaryShortcuts(){
                // Request check current tab url was bound in message-handler.js
                chrome.runtime.sendMessage({primary: true}, shortcuts => {
                    this.primaryShortcuts = shortcuts;
                    this.checkShortcutBound(shortcuts);
                    this.primary = true;
                });
            },
            queryDomainSecondaryShortcuts() {
                chrome.runtime.sendMessage({secondary: true, url: this.tab.url}, shortcuts => {
                    this.secondaryShortcuts = shortcuts;
                    this.checkShortcutBound(shortcuts);
                });
            },
            checkShortcutBound(shortcuts){
                for (let key in shortcuts) {
                    // Simply checks to see if this is a property specific to this class,
                    // and not one inherited from the base class.
                    if (shortcuts.hasOwnProperty(key)) {
                        let shortcut = shortcuts[key];
                        if (common.isUrlEquivalent(shortcut.url, this.tab.url)) {
                            this.key = key;
                            this.bound = true;
                            this.shortcut = shortcut;
                            break;
                        }
                    }
                }
            }
        },
        created: function() {
            common.getCurrentTab(tab => {
                this.tab = tab;
                this.queryPrimaryShortcuts();
                this.queryDomainSecondaryShortcuts();
            });
        }
    });
};