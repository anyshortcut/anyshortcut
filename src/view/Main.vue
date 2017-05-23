<template>
    <div id="main-view">
        <header>
            <div class="pure-g">
                <div class="pure-u-1-3">
                    <a href="https://anyshortcut.com" target="_blank">
                        <img src="../img/icon.png" alt="">
                        <span style="font-weight: bold">anyshortcut</span></a>
                </div>
                <div class="pure-u-1-3">
                </div>
                <div class="pure-u-1-3">
                    <a href="#/setting"><i class="fa fa-cog"></i> settings</a>
                </div>
            </div>
        </header>

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
                         :current-tab-title="currentTabTitle"
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
<style lang="less">
    @import "../less/_common.less";

    #main-view {
        width: @normal-width;
        height: @normal-height;
    }

    a:visited, a:active {
        color: @primary-color;
    }

    ul {
        list-style: none outside;
    }

    li {
        text-align: left;
        margin: 2px;
    }

    a {
        text-decoration: none;
    }

    .is-center {
        text-align: center;
    }

    header {
        padding: 5px;
        border-bottom: #eeeeee solid 2px;
    }

    header img, i {
        vertical-align: middle;
    }

    #shortcut_key, #option-shortcut-key {
        border-color: rgb(61, 149, 92);
        width: 35px;
        text-align: center;
        font-weight: bold;
        font-size: medium;
        text-transform: uppercase;
    }

    #bind_shortcut_button {
        background-color: rgb(61, 149, 92);
        text-align: center;
        padding: 10px;
        color: white;
        align-self: center;
        border: none;
        border-radius: 3px;
        margin: 20px;
        width: 80%;
    }

    #unbind_shortcut_button {
        background-color: rgb(181, 61, 10);
        text-align: center;
        padding: 10px;
        color: white;
        align-self: center;
        border: none;
        border-radius: 3px;
        margin: 20px;
        width: 80%;
    }

    #popover {
        border: 2px #dd4814;
        background-color: #ffffff;
        width: 50%;
    }

    div.loading {
        position: fixed;
        bottom: 50%;
        right: 50%;
        color: gray;
        text-align: center;
    }
</style>
<script>
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
                this.forceBinding = forceBinding;

                if (!this.key) {
                    this.$message.warn('Must select a key!');
                    return;
                }

                let options;
                if (this.primary) {
                    options = {
                        save: true,
                        key: keyChar,
                        comment: comment,
                        force: this.forceBinding,
                    };
                } else {
                    options = {
                        secondarySave: true,
                        key: keyChar,
                        comment: comment,
                        force: this.forceBinding,
                    };
                }

                this.loading = true;
                chrome.runtime.sendMessage(options, result => {
                    this.loading = false;

                    if (result) {
                        this.queryShortcuts();
                        this.$message.success('Great job!you have bound a shortcut for this url!');
                    }
                    else {
                        this.$message.error('Ooops!');
                    }
                });

            },
            handleShortcutUnbinding: function() {
                if (this.shortcut) {
                    let options;
                    if (this.shortcut.primary) {
                        options = {
                            remove: true,
                            key: this.shortcut.key
                        }
                    } else {
                        options = {
                            secondaryRemove: true,
                            id: this.shortcut.id,
                            key: this.shortcut.key,
                            url: this.tab.url,
                        }
                    }

                    chrome.runtime.sendMessage(options, result => {
                        this.loading = false;

                        if (result) {
                            this.shortcut = null;
                            this.domainPrimaryShortcut = null;
                            this.$message.success('Delete Success!');
                            this.queryShortcuts();
                        } else {
                            this.$message.error('Ooops!');
                        }
                    });

                }
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