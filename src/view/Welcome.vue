<template>
    <main>
        <a class="anyshortcut" href="https://anyshortcut.com" target="_blank">
            <img class="brand-logo" alt="">
            <span>anyshortcut</span>
        </a>
        <img class="balloon-image" src="../img/computer-and-balloons.svg" alt="">
        <div class="introduction">
            Sign in to boost productivity and sync your shortcuts!
        </div>
        <a class="attractive-button" :href="config.baseURL + '/sign_in'"
           title="No email register required"
           target="_blank">Sign In Now</a>
        <footer>
            <a :href="config.baseURL + '/terms'" target="_blank" class="grey-link">Terms Of Service</a>
            <a :href="config.baseURL + '/privacy'" target="_blank" class="grey-link">Privacy Policy</a>
        </footer>
    </main>
</template>
<style lang="less">
    @import "../less/_common.less";

    main {
        line-height: 2em;
        width: 400px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .anyshortcut {
        .brand;
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
        padding: 10px;
        margin: 25px;
        font-weight: 600;
        font-size: 16px;
        line-height: 1.5;
    }

    a:focus {
        text-decoration: none;
        outline: none;
    }

    .attractive-button {
        .positive-gradient;
        width: 60%;
        font-size: 15px;
        border-radius: 3px;
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
    import config from "../js/config.js";

    export default {
        name: 'welcome-view',
        data() {
            return {
                config: config,
            }
        },
    }
</script>