<template>
    <div>
        <ul v-if="shortcuts">
            <li class="shortcut-list-item" v-for="(shortcut,key) in shortcuts">
                <div class="shortcut-secondary">{{key}}</div>
                <div class="shortcut-comment">
                    <a :href="shortcut.url" target="_blank">{{shortcut.comment || shortcut.title}}</a>
                    <img class="delete-button"
                         src="../img/delete.svg" alt="Delete"
                         @click="handleShortcutUnbinding(shortcut)"/>
                </div>
            </li>
        </ul>
        <div class="shortcut-empty-list" v-else>
            No secondary shortcut bound yet, go ahead to bound!
        </div>
    </div>
</template>
<style lang="less">
    @import "../less/_common.less";

    ul {
        list-style: none outside;
    }

    li {
        text-align: left;
        margin: 5px;
    }

    .shortcut-secondary {
        .shortcut;
        display: inline-block;
        width: 36px;
        height: 30px;
        font-size: 15px;
    }

    .shortcut-comment {
        display: inline-block;
    }

    .delete-button {
        vertical-align: middle;
    }

    .delete-button:hover {
        display: inline-block;
        cursor: pointer;
        content: url("../img/delete-dark.svg");
    }

    .shortcut-empty-list {
        width: 400px;
    }
</style>
<script type="es6">
    import mixin from "../js/mixin.js";

    export default{
        name: 'shortcut-list',
        props: {
            shortcuts: {
                type: Object,
                default: function() {
                    return {};
                }
            }
        },
        mixins: [mixin],
    }
</script>