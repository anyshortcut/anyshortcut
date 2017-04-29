import Vue from "vue";
import moment from "moment";
import Popper from "popper";
import Keyboard from "../component/Keyboard.vue";
import Popover from "../component/Popover.vue";
import common from "./common.js";
import auth from "./background/auth.js";
import _ from "lodash";

require("../less/popup.less");

window.onload = function() {
    let vm = new Vue({
        el: '#vue',
        data: {
            tab: null,
            key: null,// Selected and hovered key
            shortcut: null,
            domainPrimaryShortcut: null, //current tab domain primary shortcut.
            boundTips: '',
            boundKeys: null,// All bound keys, for keyboard component usage.
            primary: true,
            shortcuts: null,
            showPopper: false,
        },
        computed: {
            authenticated: function() {
                return auth.isAuthenticated();
            },
            currentTabTitle: function() {
                if (this.tab && this.tab.title) {
                    return this.tab.title.substring(0, 20);
                }
                return '';
            },
            // A mouse hovered shortcut computed object
            hoveredShortcut: function() {
                if (this.boundKeys && this.boundKeys.indexOf(this.key) !== -1) {
                    return this.shortcuts[this.key];
                } else {
                    return null;
                }
            }
        },
        components: {
            Keyboard,
            Popover,
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
            handleShortcutBinding: function(keyChar, comment, forceBinding) {
                this.key = keyChar;
                this.comment = comment;
                this.forceBinding = forceBinding;

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
                    // Find current tab domain primary shortcut.
                    _.forOwn(response.primaryShortcuts, (shortcut) => {
                        if (common.isUrlEndsWithDomain(this.tab.url, shortcut.domain)) {
                            this.domainPrimaryShortcut = shortcut;
                            // return false to exit the for iterate after find the result.
                            return false;
                        }
                    });

                    if (this.domainPrimaryShortcut) {
                        // If current tab domain bound primary shortcut, then only permit to bound secondary shortcuts.
                        // TODO display the primary shortcut when show secondary shortcut keys?
                        this.shortcuts = response.secondaryShortcuts;
                        this.primary = false;
                    } else {
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