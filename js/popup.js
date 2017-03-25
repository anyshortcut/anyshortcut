import Vue from "vue";
import moment from "moment";
import Popper from "popper.js";
import Keyboard from "../component/Keyboard.vue";
import common from "./common.js";
import auth from "./background/auth.js";

window.onload = function() {
    let vm = new Vue({
        el: '#vue',
        data: {
            tab: null,
            key: null,// Selected and hovered key
            shortcut: null,
            boundTips: '',
            boundKeys: null,// All bound keys, for keyboard component usage.
            comment: null,
            primary: true,
            forceBinding: false, // Bind shortcut by force or not
            shortcuts: null,
            showPopper: false,
        },
        computed: {
            authenticated: function() {
                return auth.isAuthenticated();
            },
            hoveredShortcut: function() {
                if (this.boundKeys && this.boundKeys.indexOf(this.key) !== -1) {
                    return this.shortcuts[this.key];
                } else {
                    return null;
                }
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
            onKeyHoverOver: function(target) {
                this.onHoverOver();
                this.key = target.innerText;
                new Popper(target, document.querySelector("#popover"), {
                    placement: "top"
                });
                this.forceBinding = false;
            },
            onHoverLeave: function() {
                this._timeoutId = setTimeout(() => {
                    this.key = null;
                    this.showPopper = false;
                }, 200);
            },
            onHoverOver: function() {
                this.showPopper = true;
                clearTimeout(this._timeoutId);
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
                chrome.runtime.sendMessage({
                    save: true,
                    key: this.key,
                    comment: this.comment,
                    force: this.forceBinding,
                }, result => {
                    if (result) {
                        this.boundTips = 'Great job!you have bound a shortcut for this url!';
                        this.queryShortcuts();
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
                    comment: this.comment,
                    force: this.forceBinding,
                }, result => {
                    if (result) {
                        this.queryShortcuts();
                    } else {
                        this.boundTips = 'Ooops!';
                    }
                });
            },
            handleShortcutUnbinding: function() {
                if (this.shortcut) {
                    if (this.shortcut.primary) {
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
                        this.queryShortcuts();
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
                        this.queryShortcuts();
                    } else {
                        this.boundTips = 'Ooops!';
                    }
                });
            },
            queryShortcuts(){
                chrome.runtime.sendMessage({all: true, url: this.tab.url}, response => {
                    if (!common.isObjectEmpty(response.secondaryShortcuts)) {
                        this.shortcuts = response.secondaryShortcuts;
                        this.primary = false;
                    } else if (!common.isObjectEmpty(response.primaryShortcuts)) {
                        this.shortcuts = response.primaryShortcuts;
                        this.primary = true;
                    }

                    if (this.shortcuts) {
                        this.boundKeys = Object.keys(this.shortcuts);
                    }

                    // Iterate both primary shortcuts and secondary shortcuts
                    // to ensure don't miss the bound shortcut.
                    for (let key in response) {
                        if (response.hasOwnProperty(key)) {
                            this.checkShortcutBound(response[key]);
                        }
                    }
                });
            },
            checkShortcutBound(shortcuts){
                for (let key in shortcuts) {
                    // Simply checks to see if this is a property specific to this class,
                    // and not one inherited from the base class.
                    if (shortcuts.hasOwnProperty(key)) {
                        let shortcut = shortcuts[key];
                        if (common.isUrlEquivalent(shortcut.url, this.tab.url)) {
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
                this.queryShortcuts();
            });
        }
    });
};