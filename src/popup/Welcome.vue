<template>
    <main>
        <a class="anyshortcut" href="https://anyshortcut.com" target="_blank">
            <img class="brand-logo" alt="logo" src="../../extension/icon/logo.svg">
        </a>
        <img class="balloon-image" src="../img/computer-and-balloons.svg" alt="">
        <div class="subtitle introduction">
            Sign in to boost productivity and sync your shortcuts!
        </div>
        <div class="btn-google-sign-in"
             @click="openAuthPopupWindow">
            Sign in with Google
        </div>
        <footer>
            <a :href="config.baseURL + '/terms'" target="_blank" class="grey-link">Terms Of Service</a>
            <a :href="config.baseURL + '/privacy'" target="_blank" class="grey-link">Privacy Policy</a>
        </footer>
    </main>
</template>
<style lang="scss">
    @import "../scss/common";

    main {
        line-height: 2em;
        width: 400px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .anyshortcut {
        @extend .brand;
        font-size: 18px;
        position: relative;
        top: 0;
        left: 0;
        padding: 8px;
        align-self: flex-start;
    }

    .balloon-image {
        margin: 20px;
    }

    .introduction {
        margin: 30px 30px 20px;
    }

    a:focus {
        text-decoration: none;
        outline: none;
    }

    .btn-google-sign-in {
        padding: 3px 25px;
        letter-spacing: .1em;
        background: #fff;
        border: none;
        width: 70%;
        border-radius: 4px;
        margin: auto;
        color: #777;
        text-transform: none;
        font-size: 15px;
        text-shadow: none;
        box-shadow: 0 1px 2px rgba(0, 0, 0, .2);
        background-image: url("../img/google-g.png");
        background-repeat: no-repeat;
        background-size: 18px;
        background-position: 10% 50%;
        cursor: pointer;
    }

    footer {
        font-size: 12px;
        margin: 30px 0 0;
    }

    .grey-link {
        margin: 0 10px;
        text-decoration: underline;
        color: grey;
    }
</style>
<script type="es6">
    import config from "../config.js";
    import common from "../common.js";

    export default {
        name: 'welcome-view',
        data() {
            return {
                config: config,
            }
        },
        methods: {
            openAuthPopupWindow() {
                common.openPopupWindow(config.googleAuthURL);
            },
        }
    }
</script>