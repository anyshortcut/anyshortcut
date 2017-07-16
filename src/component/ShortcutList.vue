<template>
    <ul v-if="Object.keys(shortcuts).length">
        <li class="shortcut-list-item"
            @mouseover="hoveredKey=key"
            @mouseleave="hoveredKey=null"
            v-for="(shortcut,key) in shortcuts">
            <div class="shortcut-secondary" :title="shortcut.title">{{key}}</div>
            <a class="shortcut-comment"
               :href="shortcut.url"
               :title="shortcut.url"
               target="_blank">{{shortcut.comment || shortcut.title}}</a>
            <img class="delete-button"
                 v-visible="hoveredKey === key"
                 @click="handleShortcutUnbinding(shortcut)"/>
        </li>
    </ul>
    <div class="shortcut-empty-list" v-else>
        <img src="../img/grey-balloons.svg" alt="">
        <p>No secondary shortcut bound yet, go ahead to bound!</p>
    </div>
</template>
<style lang="less">
    @import "../less/_common.less";

    ul {
        list-style: none outside;
        margin: 0 auto;
        padding: 5px;
        width: 420px;
    }

    .shortcut-list-item {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        border-color: #f4f4f4;
        border-width: 0;
        border-bottom-width: 1px;
        border-style: solid;
        padding: 3px 8px;
        font-size: 15px;

        &:hover {
            background: #f8f8f8;
        }

        &:last-child {
            border-width: 0;
        }
    }

    .shortcut-secondary {
        .shortcut;
        display: inline-block;
        width: 38px;
        height: 28px;
        letter-spacing: 0.6px;
        font-size: 15px;
    }

    @shortcut-comment-color: #333333;
    .shortcut-comment {
        margin: 0 10px;
        flex: 1;
        text-transform: capitalize;
        text-align: left;
        white-space: nowrap;
        text-overflow: ellipsis;
        color: @shortcut-comment-color;

        &:visited, &:active {
            color: @shortcut-comment-color;
        }
    }

    .delete-button:hover {
        cursor: pointer;
        content: url("../img/delete.svg");
    }

    .shortcut-empty-list {
        display: flex;
        align-items: center;
        flex-direction: column;
        width: 400px;
        text-align: center;

        img {
            margin-top: 20px;
            margin-bottom: 10px;
        }

        p {
            color: #999999;
            padding: 8px 80px;
            font-size: 14px;
            line-height: 1.5;
        }
    }
</style>
<script type="es6">
    import mixin from "../js/mixin.js";

    export default{
        name: 'shortcut-list',
        data(){
            return {
                hoveredKey: null
            }
        },
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