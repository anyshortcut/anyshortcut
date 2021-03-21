<template>
    <div class="dashboard-bar">
        <div style="display: flex;align-items: center;">
            <img class="avatar" :src="user.picture" alt="">
            <span class="given-name">
                {{ user.given_name }}
            </span>

            <img id="setting-icon"
                 src="/img/settings.svg" alt=""
                 style="margin-left: auto;cursor: pointer">
        </div>

        <div style="text-align: center">
            <div class="subscription-status status-trailing"
                 v-if="subscription.status === 'trialing'">
                trialing
            </div>
            <div class="subscription-status status-active"
                 v-else-if="subscription.status === 'active'">
                subscribed
            </div>
            <div class="subscription-status status-failed"
                 v-else>
                {{ subscription.status.replace('_', ' ') }}
            </div>
        </div>

        <popover :ref-id="'setting-icon'"
                 :placement="'bottom'"
                 class="setting-dropdown"
                 style="padding: 2px 0">
            <a href="https://chrome.google.com/webstore/detail/anyshortcut/ginilcdjefkbpeelgekodpmmabppcfao/reviews"
               target="_blank">
                Rate us ❤️
            </a>
            <div class="divider"></div>
            <a href="https://twitter.com/anyshortcut" target="_blank" title="@anyshortcut">
                Twitter 🎉
            </a>
            <div class="divider"></div>
            <a href="https://t.me/anyshortcut" target="_blank" title="@anyshortcut">
                Telegram Channel 🎊
            </a>
            <div class="divider"></div>
            <a href="https://t.me/anyshortcut_group" target="_blank" title="@anyshortcut_group">
                Telegram Group 🎈
            </a>
            <div class="divider"></div>
            <a @click="signOut">Sign out</a>
        </popover>
    </div>
</template>
<style lang="scss">
    .dashboard-bar {
        display: block;
        padding: 15px;
    }

    .avatar {
        width: 36px;
        height: 36px;
        border: none;
        border-radius: 50%;
        overflow: hidden;
        vertical-align: middle;
    }

    .given-name {
        overflow: hidden;
        margin: auto 10px;
        max-width: 100px;
        font-size: 16px;
    }

    .setting-dropdown {
        width: 180px;
        border: 1px solid #ECECEC;
    }

    .setting-dropdown > a {
        position: relative;
        display: block;
        padding: 0 20px;
        font-weight: 400;
        height: 36px;
        line-height: 36px;
        overflow: hidden;
        min-width: 110px;
        color: rgba(0, 0, 0, 0.85);
        font-size: 13px;
        text-decoration: none;

        &:hover {
            text-decoration: none;
            background-color: #eee;
        }
    }

    .subscription-status {
        font-size: 12px;
        display: inline-block;
        color: #FFFFFF;
        border-radius: 10px;
        padding: 0 10px;
        margin: 15px;
    }

    .status-trailing {
        background-color: #FAC64B;
    }

    .status-active {
        background-color: #26A85E;
    }

    .status-failed {
        background-color: #FC0D1B;
    }
</style>
<script type="es6">
    import client from "@/js/client.js";
    import config from "@/js/config.js";
    import Cookies from 'js-cookie';
    import Popover from "@/component/Popover.vue";

    export default {
        name: "DashboardBar",
        props: {
            user: {
                type: Object,
                default: function () {
                    return {};
                }
            },
            subscription: {
                type: Object,
                default: function () {
                    return {};
                }
            },
        },
        components: {
            Popover,
        },
        methods: {
            signOut() {
                client.signOut().then(data => {
                    Cookies.remove(config.LOGIN_TIME_KEY);
                    // this.$router.replace('/login');
                    window.location.reload();
                }).catch(error => {
                });
            },
        }
    }
</script>