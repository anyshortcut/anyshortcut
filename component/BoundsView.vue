<template>
    <div id="content">

        <ul id="left-nav">
            <li class="nav-item active"><a v-link="{path:'/bounds/origin'}">Origin Shortcut</a></li>
            <li class="nav-item"><a v-link="{path:'/bounds/option'}">Option Shortcut</a></li>
        </ul>

        <router-view></router-view>
    </div>
</template>
<style>

    ul#left-nav {
        display: inline-block;
        list-style-type: none;
        margin: 0;
        padding: 0;
        height: 100%;
        width: 15%;
        bottom: 0;
        background-color: #F1F1F1;
        overflow: auto;
    }

    li.nav-item {
        padding: 10px 25px 10px 25px;
        text-align: center;
        display: block;
    }

    li > a {
        text-decoration: none;
    }

    li > a:visited {
        color: inherit;
    }

    li > a:hover {
        color: white;
        text-decoration: none;
    }

    li.active {
        background-color: #47B04B;
        color: white;
    }

    li.nav-item:hover {
        background-color: #47B04B;
        color: white;
    }
</style>
<script>
    export default{}
</script>