<template>
    <ul v-if="shortcuts && Object.keys(shortcuts).length">
        <li v-for="(shortcut,key) in shortcuts"
            :key="key"
            @mouseover="hoveredKey=key"
            @mouseleave="hoveredKey=null">
            <div class="list-item"
                 @click="$emit('shortcut-key-click',shortcut)">
                <img :src="shortcut.favicon" alt="">
                <div :title="shortcut.title" class="list-item-content">
                    <div>
                        {{ shortcut.comment }}
                    </div>
                    <small>
                        {{ shortcut.url }}
                    </small>
                </div>
                <span class="shortcut-key">{{ shortcut.key }}</span>
                <div class="list-item-action" v-visible="hoveredKey === key" @click="$event.stopPropagation()">

                    <a :href="shortcut.url" target="_blank">
                        <i class="icon-share-alt" aria-hidden="true" title="Open the link"></i>
                    </a>
                    <i class="icon-trash" aria-hidden="true" title="Delete the shortcut"
                       @click="$bus.emit('unbind-shortcut',shortcut)">
                    </i>
                </div>
            </div>
        </li>
    </ul>
    <div class="empty-list" v-else>
        <img class="grey-balloons" alt="empty" src="../img/grey-balloons.svg">
        <p>No secondary shortcut bound yet</p>
    </div>
</template>
<style lang="scss" scoped>
    @import "../scss/_common.scss";

    ul {
        list-style: none outside;
        margin: 0;
        padding: 0;

        & > li {
            border-color: #f4f4f4;
            border-width: 0;
            border-bottom-width: 1px;
            border-style: solid;
            cursor: pointer;

            &:hover {
                background: #f8f8f8;
            }

            &:last-child {
                border-width: 0;
            }
        }
    }

    .list-item {
        position: relative;
        overflow: hidden;
        white-space: nowrap;
        display: flex;
        align-items: center;
        padding: 15px;

        & img {
            width: 32px;
            height: 32px;
        }

        & .list-item-content {
            overflow: hidden;
            white-space: nowrap;
            flex: 1;
            margin-left: 10px;
            text-align: start;

            & > div {
                line-height: 20px;
                font-family: 'Poppins', sans-serif;
                font-weight: 500;
                color: #555555;
                text-transform: capitalize;
                letter-spacing: 0;
                display: block;
                font-size: 16px;
            }
        }

        & small {
            padding: 5px 0;
            font-size: 14px;
            color: #999;
        }

        & > span {
            margin-left: auto;
        }
    }

    .shortcut-key {
        @extend .shortcut;
        display: inline-block;
        letter-spacing: 0.6px;
        font-size: 14px;
        padding: 0;
        margin: 0;
        width: 35px;
    }

    .list-item-action {
        position: absolute;
        right: 10px;
        width: 80px;
        padding: 2px 12px;
        text-align: center;
        background-color: #ffffff;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(222, 222, 222, .12), 0 0 6px rgba(222, 222, 222, .04);

        & i {
            margin: 0 8px;
            cursor: pointer;
            vertical-align: middle;
            color: #999999;

            &:hover {
                color: #1882ef;
            }

        }
    }

    .empty-list {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: center;
        height: 100%;
        text-align: center;
        color: #999999;
        padding: 3rem 0;
        font-size: 15px;
        line-height: 1.5;
    }
</style>
<script type="es6">
    export default {
        name: 'ShortcutList',
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