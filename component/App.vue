<template>
    <div id="app">

        <div id="header">

            <h3><a class="white-link" href="/">Spruce</a></h3>

            <nav>
                <a class="white-link" v-link="{path:'/bounds'}">Bounds</a>
                <a class="white-link" v-link="{path:'/settings'}">Settings</a>
                <a class="white-link" v-link="{path:'/about'}">About</a>
            </nav>
        </div>

        <!--router outlet-->
        <router-view></router-view>
    </div>
</template>
<style>
    html, body, div {
        margin: 0;
        padding: 0;
        overflow-x: hidden;
    }

    div#header {
        width: 100%;
        height: 80px;
        background-color: #DD4814;
        padding: 10px;
    }

    div > h3, nav {
        display: inline;
        color: #ffffff;
    }

    .white-link {
        color: white;
    }

    a {
        text-decoration: none;
    }

    nav {
        float: right;
        margin-right: 30px;
    }

</style>
<script>
    export default{}
</script>