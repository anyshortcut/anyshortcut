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
        <div class="loading" v-show="loading"><i class="fa fa-spinner fa-spin fa-2x fa-fw"></i></div>
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
                loading: false,
                domainShortcut: null,
            }
        },
        methods: {
            queryShortcuts() {
                let activeTab = this.$background.activeTab;
                let primaryShortcuts = _.cloneDeep(this.$background.primaryShortcuts);

                let foundDomainShortcut = null;
                // Find current tab domain primary shortcut.
                _.forOwn(primaryShortcuts, (shortcut) => {
                    if (common.isUrlEndsWithDomain(activeTab.url, shortcut.domain)) {
                        foundDomainShortcut = shortcut;
                        // return false to exit the for iterate after find the result.
                        return false;
                    }
                });

                if (this.domainShortcut && foundDomainShortcut
                    && common.isUrlEquivalent(foundDomainShortcut.url, this.domainShortcut.url)) {
                    // Notify children component refresh
                    this.$bus.emit('refresh');
                }

                this.domainShortcut = foundDomainShortcut;
            },
            bindShortcut: function(primary, keyChar, comment) {
                let bindFunction;
                if (primary) {
                    bindFunction = this.$background.bindPrimaryShortcut;
                } else {
                    bindFunction = this.$background.bindSecondaryShortcut;
                }

                this.loading = true;
                bindFunction(keyChar, comment).then(() => {
                    this.queryShortcuts();
                    this.loading = false;

                    this.$toast.success('Great job! you have bound a shortcut for this url!');
                }).catch(error => {
                    this.loading = false;
                    this.$toast.error(error.message);
                });
            },
            unbindShortcut: function(shortcut) {
                if (shortcut) {
                    let removeFunction;
                    if (shortcut.primary) {
                        removeFunction = this.$background.removePrimaryShortcut;
                    } else {
                        removeFunction = this.$background.removeSecondaryShortcut;
                    }

                    this.loading = true;
                    removeFunction(shortcut).then(() => {
                        this.queryShortcuts();
                        this.loading = false;

                        this.$toast.success('Delete Success!');
                    }).catch(error => {
                        this.loading = false;
                        this.$toast.error(error.message);
                    });
                }
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
            this.$bus.on('bind-shortcut', this.bindShortcut);
            this.$bus.on('unbind-shortcut', this.unbindShortcut);
        },
    }
</script>