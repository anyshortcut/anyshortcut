<template>
    <div class="content">
        <div class="logo">
            <img src="../img/icon48.png" alt=""><span>anyshortcut</span>
        </div>
        <a :href="signInUrl" target="_blank">Sign in</a> now to boost your productivity!
        <br>
        <b>It's free!</b>
    </div>
</template>
<style lang="css">
    .content {
        line-height: 2em;
    }

    .logo {
        color: #4F6EC8;
        font-size: 35px;
        font-weight: bold;
        font-family: "Arial Rounded MT Bold", serif;
        margin: 30px;
    }

    .logo img {
        vertical-align: middle;
        padding: 10px;
    }

    a:focus {
        text-decoration: none;
        outline: none;
    }
</style>
<script type="es6">
    import config from "../js/config.js";

    export default{
        name: 'welcome-view',
        computed: {
            signInUrl: function() {
                return config.baseURL + '/sign_in';
            }
        }
    }
</script>