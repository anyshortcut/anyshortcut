<template>
    <main>
        <figure class="logo">
            <img src="../img/icon48.png" alt=""><span>anyshortcut</span>
            <figcaption> Open any website by any shortcut! </figcaption>
        </figure>
        <section class="introduction">
            <a :href="signInUrl" target="_blank">Sign in</a> now to boost productivity and sync your shortcuts!
        </section>
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
    }

    .logo {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        margin: 20px;

        span {
            color: #4F6EC8;
            font-size: 35px;
            font-weight: bold;
            margin: 10px;
        }
    }

    figure img {
        padding: 10px;
    }

    figcaption {
        color: gray;
        font-size: 16px;
        display: flex;
        align-self: center;
        align-content: center;
    }

    .introduction {
        padding: 10px 40px;
    }

    a:focus {
        text-decoration: none;
        outline: none;
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