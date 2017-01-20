import Vue from "vue";
import moment from "moment";
import Keyboard from "../component/Keyboard.vue";
import common from "./common.js";
import auth from "./background/auth.js";

window.onload = function() {
    let vm = new Vue({
        el: '#vue',
        data: {
            tab: null,
            key: null,// Selected key
            shortcut: null,
            boundTips: '',
            boundKeys: null,// All bound keys, for keyboard component usage.
            comment: null,
            primary: true,
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
            primary: function(newValue) {
                if (newValue) {
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
            onKeyChanged: function(key) {
                this.key = key;
            },
            handleShortcutBinding: function() {
                if (!this.key) {
                    this.boundTips = 'Must select a key';
                    return;
                }

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
            handleShortcutUnbinding: function() {
                if (this.shortcut) {
                    if (this.primary) {
                        this.unbindPrimaryShortcut();
                    } else {
                        this.unbindSecondaryShortcut();
                    }
                }
            },
            unbindPrimaryShortcut: function() {
                chrome.runtime.sendMessage({remove: true, key: this.shortcut.key}, result => {
                    if (result) {
                        this.shortcut = null;
                        this.boundTips = 'Delete Success!';
                        this.queryDomainSecondaryShortcuts();
                    } else {
                        this.boundTips = 'Ooops!';
                    }
                });
            },
            unbindSecondaryShortcut: function() {
                chrome.runtime.sendMessage({
                    secondaryRemove: true,
                    id: this.shortcut.id,
                    key: this.shortcut.key,
                    url: this.tab.url,
                }, result => {
                    if (result) {
                        this.shortcut = null;
                        this.boundTips = 'Delete Success!';
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
                    this.boundKeys = Object.keys(this.primaryShortcuts || []);
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
                            this.primary = shortcut.primary;
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