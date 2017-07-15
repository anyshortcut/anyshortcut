<template>
    <main>
        <a class="anyshortcut" href="https://anyshortcut.com" target="_blank">
            <img class="brand-logo" alt="">
            <span>anyshortcut</span>
        </a>
        <img class="balloon-image" src="../img/computer-and-balloons.svg" alt="">
        <section class="introduction">
            Sign in to boost productivity and sync your shortcuts!
        </section>
        <a class="attractive-button" :href="signInUrl" target="_blank">Sign Up Now</a>
        <footer>
            <a :href="tryUrl" target="_blank" class="grey-link">I just wanna a try now</a>
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
        margin: 15px;
    }

    .introduction {
        padding: 10px 40px;
        font-weight: 600;
        font-size: 16px;
    }

    a:focus {
        text-decoration: none;
        outline: none;
    }

    .attractive-button {
        width: 60%;
        background: linear-gradient(@secondary-color, @primary-color);
        color: #FFFFFF;
        font-size: 15px;
        border-radius: 3px;

        &:hover {
            background: linear-gradient(@primary-color, #3A56A8);
        }
    }

    footer {
        padding: 10px;
    }

    .grey-link {
        text-decoration: underline;
        color: grey;
        font-size: 14px;
    }
</style>
<script type="es6">
    import config from "../js/config.js";

    export default{
        name: 'welcome-view',
        computed: {
            signInUrl: function() {
                return config.baseURL + '/sign_in';
            },
            tryUrl: function() {
                return config.baseURL + '/try'
            }
        }
    }
</script>