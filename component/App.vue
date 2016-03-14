<template>
    <div id="app">

        <h3><a v-link="{path:'/'}">Spruce</a></h3>

        <nav>
            <a v-link="{path:'/bounds'}">Bounds</a>
            <a v-link="{path:'/settings'}">Settings</a>
        </nav>

        <!--router outlet-->
        <router-view></router-view>
    </div>
</template>
<style>
    nav {
        float: right;
    }

    div > a {

    }
</style>
<script>
    export default{}
</script>