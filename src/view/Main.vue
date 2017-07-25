<template>
    <div class="main-view">
        <header class="main-header">
            <a class="brand" href="https://anyshortcut.com" target="_blank">
                <img class="brand-logo" alt="">
                <span>anyshortcut</span>
            </a>
            <a href="#/setting" class="menu">Settings</a>
        </header>

        <bound-view v-if="shortcut"
                    :shortcut="shortcut">
        </bound-view>

        <bind-view v-else
                   :shortcuts="shortcuts"
                   :primary="primary"
                   :domain-primary-shortcut="domainPrimaryShortcut">
        </bind-view>
        <section v-if="domainPrimaryShortcut" class="secondary-shortcut-list">
            <div>
                <span class="shortcut-domain">
                    <img class="shortcut-favicon"
                         :src="domainPrimaryShortcut.favicon"
                         alt="favicon"/>
                    {{domainPrimaryShortcut.domain}}
                </span>'s secondary shortcuts:
            </div>
            <shortcut-list :shortcuts="shortcuts"></shortcut-list>
        </section>
    </div>
</template>
<style lang="less">
    @import "../less/_common.less";

    body {
        font-family: "Poppins", sans-serif;
        font-weight: 400;
        font-size: 100%;
        color: @content-font-color;
        text-align: center;
        margin: 0 auto;
    }

    * {
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
    }

    p {
        margin: 0 auto;
    }

    a {
        text-decoration: none;
        outline: none;
    }

    .main-view {
        width: @normal-width;
        display: flex;
        flex-direction: column;
        align-content: center;
        background: @content-bgcolor;
    }

    .main-header {
        .header;
    }

    .menu {
        color: @menu-color;
        font-size: 12.5px;
        letter-spacing: 0.6px;

        a:visited, a:active {
            color: @menu-color;
        }
    }

    .secondary-shortcut-list {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: -10px;
        font-size: 16px;
    }

</style>
<script>
    import common from "../js/common.js";
    import _ from "lodash";
    import BoundView from "./BoundView.vue";
    import BindView from "./BindView.vue";
    import ShortcutList from "../component/ShortcutList.vue";

    export default {
        name: 'main-view',
        data() {
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
            ShortcutList,
        },
        methods: {
            queryShortcuts() {
                this.shortcut = null;
                this.domainPrimaryShortcut = null;

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

                // Due to Javascript object reference, we need to pick by a new shortcuts Object,
                // otherwise can't trigger BindView shortcuts value change.
                let pickByFunction = (value, key) => {
                    return key.length === 1;
                };
                if (this.domainPrimaryShortcut) {
                    // If current tab domain bound primary shortcut,
                    // then only permit to bound secondary shortcuts.
                    this.shortcuts = _.pickBy(secondaryShortcuts, pickByFunction);
                    this.primary = false;
                } else {
                    this.shortcuts = _.pickBy(primaryShortcuts, pickByFunction);
                    this.primary = true;
                }

                // Iterate both primary shortcuts firstly to find the bound shortcut,
                // otherwise to iterate secondary shortcuts to ensure don't miss the bound shortcut.
                this.checkShortcutBound(primaryShortcuts) || this.checkShortcutBound(secondaryShortcuts);
            },
            checkShortcutBound(shortcuts) {
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
        },
    }
</script>