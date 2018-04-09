<template>
    <div v-if="$background.isActiveTabUrlSupported()"
         class="main-view">
        <header class="main-header">
            <a class="brand" href="https://anyshortcut.com" target="_blank">
                <img class="brand-logo" alt="logo" src="../../extension/icon/logo.svg">
            </a>
            <router-link :to="{name:'preference'}" class="menu">Settings</router-link>
        </header>
        <shortcut-view v-if="domainShortcut" :domain-shortcut="domainShortcut"></shortcut-view>
        <bind-view v-else></bind-view>
    </div>
    <div class="unsupported-view" v-else>
        <header class="main-header">
            <a class="brand" href="https://anyshortcut.com" target="_blank">
                <img class="brand-logo" alt="logo" src="../../extension/icon/logo.svg">
            </a>
            <router-link :to="{name:'preference'}" class="menu">Settings</router-link>
        </header>
        <p>
            For technical reasons, we currently do not support set shortcut or trigger shortcut on this page.
        </p>
    </div>
</template>
<style lang="scss">
    @import "../scss/common.scss";

    body {
        font-family: "Poppins", sans-serif;
        font-weight: 400;
        font-size: 100%;
        color: $content-font-color;
        text-align: center;
        margin: 0 auto;
    }

    .main-view {
        display: flex;
        flex-direction: column;
        align-content: center;
        background: $content-bgcolor;
    }

    .main-header {
        @include header;
    }

    .menu {
        color: $menu-color;
        font-size: 12.5px;
        letter-spacing: 0.6px;
        margin: 0 5px;

        a:visited, a:active {
            color: $menu-color;
        }
    }

    .unsupported-view {
        width: 450px;
        height: 150px;
        display: flex;
        flex-direction: column;
        align-content: center;
        background: $content-bgcolor;

        p {
            font-size: 16px;
            color: #515151;
            margin: auto 20px;
        }
    }

</style>
<script>
    import common from "../js/common.js";
    import _ from "lodash";
    import ShortcutView from "../view/ShortcutView.vue";
    import BindView from "../view/BindView.vue";

    export default {
        name: 'MainView',
        data() {
            return {
                domainShortcut: null,
            }
        },
        methods: {
            queryShortcuts() {
                this.domainShortcut = null;

                let activeTab = this.$background.activeTab;
                let primaryShortcuts = _.cloneDeep(this.$background.primaryShortcuts);

                // Find current tab domain primary shortcut.
                _.forOwn(primaryShortcuts, (shortcut) => {
                    if (common.isUrlEndsWithDomain(activeTab.url, shortcut.domain)) {
                        this.domainShortcut = shortcut;
                        // return false to exit the for iterate after find the result.
                        return false;
                    }
                });
            },
        },
        components: {
            ShortcutView,
            BindView,
        },
        created: function() {
            this.queryShortcuts();
        },
        mounted() {
            this.$bus.on('refresh-main-view', () => {
                this.queryShortcuts();
            });
        },
    }
</script>