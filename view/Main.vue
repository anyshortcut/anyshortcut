<template>
    <div>
        <header>
            <div class="pure-g">
                <div class="pure-u-1-3">
                    <a href="https://anyshortcut.com" target="_blank">
                        <img src="../extension/images/icon.png" alt="">
                        <span style="font-weight: bold">anyshortcut</span></a>
                </div>
                <div class="pure-u-1-3">
                </div>
                <div class="pure-u-1-3">
                    <a href="#/setting"><i class="fa fa-cog"></i> settings</a>
                </div>
            </div>
        </header>

        <div id="bound_tips">{{boundTips}}</div>
        <div id="unbind_div" v-if="shortcut">
            <div id="unbind_guide" v-if="shortcut.primary">
                <span>
                    <strong>ALT</strong>
                </span>
                <span>+</span>
                <span>
                    <strong>SHIFT</strong>
                </span>
                <span>+</span>
                <span>
                    <strong id="bound_shortcut_key">{{shortcut.key}}</strong>
                </span>
            </div>
            <div v-else>
                <p>The url already bound with <b>ALT+{{shortcut.key}}</b></p>
            </div>
            <p id="bound_time">{{shortcut.created_time | fromNow}}</p>
            <button @click="handleShortcutUnbinding" id="unbind_shortcut_button">Delete Shortcut</button>
        </div>
        <div id="bind_div" class="pure-g" v-else>

            <div class="pure-u-1">
                <p v-if="primary">
                    Specify the shortcut:
                </p>
                <div v-else>
                    <p v-if="domainPrimaryShortcut">
                        The domain <b>{{domainPrimaryShortcut.domain}}</b>
                        already bound with <b>SHIFT+ALT+{{domainPrimaryShortcut.key}}</b>
                    </p>
                    Specify the secondary shortcut for this domain:
                </div>
                <br>
            </div>


            <div class="pure-u-1 is-center">
                <keyboard :bound-keys="boundKeys"
                          @key-hover-over="onKeyHoverOver"
                          @key-hover-leave="onHoverLeave">
                </keyboard>
                <popover id="popover"
                         v-show="showPopper"
                         :key-char="key"
                         :comment="currentTabTitle"
                         :shortcut="hoveredShortcut"
                         @mouseover.native="onHoverOver"
                         @mouseleave.native="onHoverLeave"
                         @bind-click="handleShortcutBinding">
                </popover>
            </div>

        </div>
        <br>

        <div class="is-center">
            <ul v-show="shortcuts && !primary">
                <p>Here are secondary shortcut list for this domain:</p>
                <li v-for="(shortcut,key) in shortcuts">
                    <span><b>{{key}}</b></span>
                    <span>    <a :href="shortcut.url" target="_blank">{{shortcut.comment || shortcut.title}}</a></span>
                </li>
            </ul>
        </div>
        <div v-show="loading" class="loading">
            <i class="fa fa-spinner fa-spin fa-2x fa-fw"></i>
        </div>

    </div>
</template>
<style lang="css">
    div.loading {
        position: fixed;
        bottom: 50%;
        right: 50%;
        color: gray;
        text-align: center;
    }
</style>
<script type="es6">
    import moment from "moment";
    import Popper from "popper";
    import Keyboard from "../component/Keyboard.vue";
    import Popover from "../component/Popover.vue";
    import common from "../js/common.js";
    import _ from "lodash";

    export default{
        name: 'main-view',
        data(){
            return {
                tab: null,
                key: null,// Selected and hovered key
                shortcut: null,
                domainPrimaryShortcut: null, //current tab domain primary shortcut.
                boundTips: '',
                boundKeys: null,// All bound keys, for keyboard component usage.
                primary: true,
                shortcuts: null,
                showPopper: false,
                loading: false,
            }
        },
        computed: {
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
                this.loading = true;
                chrome.runtime.sendMessage({
                    save: true,
                    key: this.key,
                    comment: this.comment,
                    force: this.forceBinding,
                }, result => {
                    this.loading = false;

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
                this.loading = true;

                chrome.runtime.sendMessage({
                    secondarySave: true,
                    key: this.key,
                    comment: this.comment,
                    force: this.forceBinding,
                }, result => {
                    this.loading = false;

                    if (result) {
                        this.queryShortcuts();
                    } else {
                        this.boundTips = 'Ooops!';
                    }
                });
            },
            handleShortcutUnbinding: function() {
                // FIXME: fix unbind shortcut, local data didn't update properly
                if (this.shortcut) {
                    if (this.shortcut.primary) {
                        this.unbindPrimaryShortcut();
                    } else {
                        this.unbindSecondaryShortcut();
                    }
                }
            },
            unbindPrimaryShortcut: function() {
                this.loading = true;

                chrome.runtime.sendMessage({remove: true, key: this.shortcut.key}, result => {
                    this.loading = false;

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
                this.loading = true;

                chrome.runtime.sendMessage({
                    secondaryRemove: true,
                    id: this.shortcut.id,
                    key: this.shortcut.key,
                    url: this.tab.url,
                }, result => {
                    this.loading = false;

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
                _.forOwn(shortcuts, shortcut => {
                    if (common.isUrlEquivalent(shortcut.url, this.tab.url)) {
                        this.shortcut = shortcut;
                        return false;
                    }
                });
            }
        },
        created: function() {
            common.getCurrentTab(tab => {
                this.tab = tab;
                this.queryShortcuts();
            });
        }
    }
</script>