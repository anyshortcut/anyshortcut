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

        <div v-if="shortcut">
            <bound-view :shortcut="shortcut"
                        @pre-unbind="loading=true"
                        @post-unbind="onPostUnbind">
            </bound-view>
        </div>

        <div class="pure-g" v-else>
            <bind-view :shortcuts="shortcuts"
                       :primary="primary"
                       :domain-primary-shortcut="domainPrimaryShortcut"
                       :tab="tab"
                       @pre-bind="loading=true"
                       @post-bind="onPostBind">
            </bind-view>
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

    div.loading {
        position: fixed;
        bottom: 50%;
        right: 50%;
        color: gray;
        text-align: center;
    }
</style>
<script>
    import common from "../js/common.js";
    import _ from "lodash";
    import BoundView from "./BoundView.vue";
    import BindView from "./BindView.vue";

    export default{
        name: 'main-view',
        data(){
            return {
                tab: null,
                shortcut: null,
                domainPrimaryShortcut: null, //current tab domain primary shortcut.
                primary: true,
                shortcuts: null,
                loading: false,
            }
        },
        components: {
            BoundView,
            BindView,
        },
        methods: {
            onPostBind: function(result) {
                this.loading = false;

                if (result) {
                    this.queryShortcuts();
                    this.$message.success('Great job!you have bound a shortcut for this url!');
                }
                else {
                    this.$message.error('Ooops!');
                }
            },
            onPostUnbind: function(result) {
                this.loading = false;

                if (result) {
                    this.shortcut = null;
                    this.domainPrimaryShortcut = null;
                    this.$message.success('Delete Success!');
                    this.queryShortcuts();
                } else {
                    this.$message.error('Ooops!');
                }
            },
            queryShortcuts(){
                chrome.runtime.sendMessage({all: true, url: this.tabUrl}, response => {
                    // Find current tab domain primary shortcut.
                    _.forOwn(response.primaryShortcuts, (shortcut) => {
                        if (common.isUrlEndsWithDomain(this.tabUrl, shortcut.domain)) {
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