<template>
    <div class="account-sign-in">
        <a href="/" target="_blank" style="z-index: 10;">
            <img src="/static/img/logo-white.svg" alt="" style="height: 32px;">
        </a>
        <div class="section has-text-centered" style="z-index: 10;">
            <div class="sign-in-form">
                <div class="heading">Sign in</div>
                <div class="text" style="width: 80%;margin: auto;">
                    Sign in with Google to manage your shortcut, subscription etc
                </div>
                <div class="button btn-google-sign-in">
                    Sign in with Google
                </div>
                <div style="font-size: 14px;opacity: 0.65;">
                    <small>
                        By signing in, I agree to
                        <a target="_blank" href="/terms">Terms of Service</a>
                        and <a target="_blank" href="/privacy">Privacy Policy</a>.
                    </small>
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
    @import "../css/common.scss";

    .account-sign-in {
        //background: linear-gradient(135deg, $primary-blue, #2b72dc);
        background: $primary-blue url("/static/img/icons-background.svg") no-repeat;
        width: 100%;
        height: 100vh;
        align-items: center;
        justify-content: center;
        display: flex;
        flex-direction: column;

        &:before {
            content: "";
            position: fixed;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.06);
            transform: rotate(135deg);
        }

        &:after {
            content: "";
            position: fixed;
            left: -22%;
            top: 80%;
            right: 0;
            width: 125%;
            height: 100%;
            /* background: linear-gradient(135deg, #ffffff 83%, #fbfbfb -20%); */
            background: rgba(255, 255, 255, 0.03);
            transform: rotate(15deg);
        }
    }
</style>
<script type="es6">
    import Vue from 'vue';
    import Cookies from 'js-cookie';
    import utils from '@/js/utils.js';
    import client from "@/js/client.js";
    import config from '@/js/config.js';

    export default {
        name: "SignIn",
        methods: {
            login() {
                Cookies.set(config.LOGIN_TIME_KEY, Date.now(), {expires: 365});
                this.$router.replace(this.$route.query.redirect || '/');
            }
        },
        mounted() {
            if (this.$el.querySelector('.btn-google-sign-in')) {
                this.$el.querySelector('.btn-google-sign-in')
                    .addEventListener('click', utils.openPopupWindow, false);
                window.addEventListener('message', event => {
                    if (event.data.action === 'logged-in') {
                        this.login();
                    }
                }, false);
            }

            // Try to get user info to check whether user signed in from the extension.
            client.getUserInfo().then(data => {
                this.login();
            }).catch(error => {
                // Otherwise remove the cookie.
                Cookies.remove(config.LOGIN_TIME_KEY);
            });
        },
    }
</script>