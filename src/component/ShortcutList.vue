<template>
    <div>
        <ul v-if="shortcuts">
            <li class="shortcut-list-item"
                @mouseover="hoveredKey=key"
                @mouseleave="hoveredKey=null"
                v-for="(shortcut,key) in shortcuts">
                <div class="shortcut-secondary">{{key}}</div>
                <a class="shortcut-comment"
                   :href="shortcut.url"
                   target="_blank">{{shortcut.comment || shortcut.title}}</a>
                <img class="delete-button"
                     src="../img/delete-light.svg" alt="Delete"
                     v-visible="hoveredKey === key"
                     @click="handleShortcutUnbinding(shortcut)"/>
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
        margin: 0 auto;
        padding: 10px 40px;
    }

    .shortcut-list-item {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        border-color: #f4f4f4;
        border-width: 0;
        border-bottom-width: 1px;
        border-style: solid;
        padding: 3px 10px;
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

    .shortcut-comment {
        margin: 0 10px;
        flex: 1;
        text-transform: capitalize;
        text-align: left;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .delete-button:hover {
        cursor: pointer;
        content: url("../img/delete.svg");
    }

    .shortcut-empty-list {
        width: 400px;
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