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
                 src="../img/delete-light.svg"
                 @click="$bus.emit('unbind-shortcut',shortcut)"/>
        </li>
    </ul>
    <div class="shortcut-empty-list" v-else>
        <img class="grey-balloons" alt="empty" src="../img/grey-balloons.svg">
        <p>No secondary shortcut bound yet</p>
    </div>
</template>
<style lang="less">
    @import "../less/_common.less";

    ul {
        list-style: none outside;
        margin: 0 auto;
        padding: 0 10px 10px;
    }

    .shortcut-list-item {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        border-color: #f4f4f4;
        border-width: 0;
        border-bottom-width: 1px;
        border-style: solid;
        padding: 8px 10px;
        font-size: 14px;

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
        letter-spacing: 0.6px;
        font-size: 14px;
        width: 42px;
    }

    @shortcut-comment-color: #555555;
    .shortcut-comment {
        .overflow-ellipsis;
        position: relative;
        width: 80%;
        margin: 0 10px;
        text-transform: capitalize;
        text-align: left;
        color: @shortcut-comment-color;

        &:visited, &:active {
            color: @shortcut-comment-color;
        }
    }

    .grey-balloons {
        margin-top: 20px;
        margin-bottom: 10px;
    }

    .shortcut-empty-list {
        display: flex;
        align-items: center;
        flex-direction: column;
        width: 400px;
        text-align: center;

        p {
            color: #999999;
            padding: 8px 80px;
            font-size: 14px;
            line-height: 1.5;
        }
    }
</style>
<script type="es6">
    export default {
        name: 'shortcut-list',
        data() {
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
    }
</script>