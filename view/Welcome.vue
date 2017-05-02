<template>
    <div>
        <div>
            <a href="https://anyshortcut.com" target="_blank">
                <span style="font-weight: bold">anyshortcut</span></a>
        </div>
        <button @click="loginWithGoogle">Log in</button>
    </div>
</template>
<style lang="css">
</style>
<script type="es6">
    import auth from "../js/background/auth.js";

    export default{
        name: 'welcome-view',
        methods: {
            loginWithGoogle: function() {
                auth.openAuthPage();
            }
        }
    }
</script>