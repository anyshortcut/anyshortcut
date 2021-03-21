<template>
    <ul v-if="shortcuts && shortcuts.length">
        <li v-for="shortcut in shortcuts">
            <div class="list-item big"
                 @click="$bus.emit('shortcut-key-click',shortcut)"
                 v-if="type==='big'">
                <img :src="shortcut.favicon" alt="">
                <div :title="shortcut.title">
                    <div>
                        {{ shortcut.comment }}
                    </div>
                    <small>
                        {{ shortcut.url }}
                    </small>
                </div>
                <span class="shortcut-key">{{ shortcut.key }}</span>
            </div>
            <a :href="shortcut.url" target="_blank"
               :title="shortcut.title"
               class="list-item small"
               v-else>
                <img :src="shortcut.favicon" alt="">
                <div>
                    <div>
                        {{ shortcut.comment }}
                    </div>
                    <small>
                        {{ shortcut.url }}
                    </small>
                </div>
                <span class="shortcut-key">{{ shortcut.key }}</span>
            </a>
        </li>
    </ul>
    <div class="empty-list" v-else-if="shortcuts && shortcuts.length===0">
        <slot>Empty</slot>
    </div>
    <div v-else>
        <shortcut-loader></shortcut-loader>
    </div>
</template>
<style lang="scss" scoped>
    ul {
        list-style: none outside;
        margin: 0;

        & > li {
            border-color: #f4f4f4;
            border-width: 0;
            border-bottom-width: 1px;
            border-style: solid;

            &:hover {
                background: #f8f8f8;
            }

            &:last-child {
                border-width: 0;
            }
        }
    }

    .list-item {
        overflow: hidden;
        white-space: nowrap;
        display: flex;
        align-items: center;

        & > div {
            overflow: hidden;
            white-space: nowrap;
            flex: 1;

            & > div {
                line-height: 20px;
                font-family: 'Poppins', sans-serif;
                font-weight: 500;
                color: #555555;
                text-transform: capitalize;
                letter-spacing: 0;
                display: block;
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

    div.big {
        padding: 15px;
        cursor: pointer;

        & img {
            width: 42px;
            height: 42px;
        }

        & > div {
            margin-left: 25px;

            & > div {
                font-size: 18px;
            }
        }

    }

    a.small {
        padding: 15px;

        & img {
            width: 32px;
            height: 32px;
        }

        & > div {
            margin-left: 10px;

            & > div {
                font-size: 16px;
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
<script>
    import ShortcutLoader from "./ShortcutLoader.vue";

    export default {
        name: 'ShortcutList',
        data() {
            return {}
        },
        props: {
            shortcuts: {
                type: Array,
                default() {
                    return [];
                }
            },
            type: {
                type: String,
                default() {
                    return 'big';
                }
            }
        },
        components: {
            ShortcutLoader,
        }
    }
</script>