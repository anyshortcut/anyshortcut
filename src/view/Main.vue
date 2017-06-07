<template>
    <div class="main-view">
        <header class="main-header">
            <div>
                <a class="brand" href="https://anyshortcut.com" target="_blank">
                    <img src="../img/icon.png" alt="">
                    <span style="font-weight: bold">anyshortcut</span>
                </a>
            </div>
            <div>
                <a href="#/setting"><i class="fa fa-cog"></i> settings</a>
            </div>
        </header>

        <bound-view v-if="shortcut"
                    :shortcut="shortcut"
                    @pre-unbind="loading=true"
                    @post-unbind="onPostUnbind">
        </bound-view>

        <bind-view v-else
                   :shortcuts="shortcuts"
                   :primary="primary"
                   :domain-primary-shortcut="domainPrimaryShortcut"
                   @pre-bind="loading=true"
                   @post-bind="onPostBind">
        </bind-view>
        <br>

        <section>
            <ul v-show="shortcuts && !primary">
                <p>Here are secondary shortcut list for this domain:</p>
                <li v-for="(shortcut,key) in shortcuts">
                    <span class="shortcut">{{key}}</span>
                    <span>    <a :href="shortcut.url" target="_blank">{{shortcut.comment || shortcut.title}}</a></span>
                </li>
            </ul>
        </section>
        <div v-show="loading" class="loading">
            <i class="fa fa-spinner fa-spin fa-2x fa-fw"></i>
        </div>

    </div>
</template>
<style lang="less">
    @import "../less/_var.less";

    .main-view {
        width: @normal-width;
        min-height: @normal-height;
        display: flex;
        flex-direction: column;
        align-content: center;
    }

    .main-header {
        .header;
    }

    .brand {
        cursor: pointer;
        display: flex;
        align-items: center;

        img {
            margin: 0 10px;
        }
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
        outline: none;
    }

    div.loading {
        position: fixed;
        bottom: 50%;
        right: 50%;
        color: gray;
        text-align: center;
    }

    .shortcut {
        .shortcut-mixin;
        font-weight: bold;
        font-size: 16px;
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
                    this.$background.setPopupIcon(true);
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
                    this.$background.setPopupIcon(false);

                    this.shortcut = null;
                    this.domainPrimaryShortcut = null;
                    this.$message.success('Delete Success!');
                    this.queryShortcuts();
                } else {
                    this.$message.error('Ooops!');
                }
            },
            queryShortcuts(){
                let activeTab = this.$background.activeTab;
                let primaryShortcuts = this.$background.primaryShortcuts;
                let secondaryShortcuts = this.$background.getSecondaryShortcutsByUrl(activeTab.url);

                // Find current tab domain primary shortcut.
                _.forOwn(primaryShortcuts, (shortcut) => {
                    if (common.isUrlEndsWithDomain(activeTab.url, shortcut.domain)) {
                        this.domainPrimaryShortcut = shortcut;
                        // return false to exit the for iterate after find the result.
                        return false;
                    }
                });

                if (this.domainPrimaryShortcut) {
                    // If current tab domain bound primary shortcut,
                    // then only permit to bound secondary shortcuts.
                    this.shortcuts = secondaryShortcuts;
                    this.primary = false;
                } else {
                    this.shortcuts = primaryShortcuts;
                    this.primary = true;
                }

                // Iterate both primary shortcuts firstly to find the bound shortcut,
                // otherwise to iterate secondary shortcuts to ensure don't miss the bound shortcut.
                this.checkShortcutBound(primaryShortcuts) || this.checkShortcutBound(secondaryShortcuts);
            },
            checkShortcutBound(shortcuts){
                _.forOwn(shortcuts, shortcut => {
                    if (common.isUrlEquivalent(shortcut.url, this.$background.activeTab.url)) {
                        this.shortcut = shortcut;
                        return false;
                    }
                });
            }
        },
        created: function() {
            this.queryShortcuts();
        }
    }
</script>