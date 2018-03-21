<template>
    <div>
        <label for="comment" v-if="parentKeyChar && parentKeyChar.length===2">
            <span class="shortcut">
                {{ keyChar }}
            </span>
            <small>in domain pages</small>
        </label>
        <label for="comment" v-else>
            <shortcut-key
                    :key-char="keyChar"
                    :parent-key-char="parentKeyChar">
            </shortcut-key>
        </label>

        <div class="shortcut-bound" v-if="shortcut">
            <a class="shortcut-comment-link" :href="shortcut.url" target="_blank" style="margin: 4px;">
                <img class="shortcut-favicon" :src="shortcut.favicon"/>
                {{ shortcut.comment }}
            </a>
            <div class="shortcut-delete-button"
                 @click="$bus.emit('unbind-shortcut',shortcut)">
                Delete
            </div>
        </div>

        <div class="shortcut-bind" v-else>
            <input id="comment"
                   class="shortcut-comment-input"
                   v-model="comment"
                   placeholder="Comment for this url"
                   maxlength="30"
                   autofocus @focus.native="$event.target.select()" required/>
            <div class="shortcut-bind-button"
                 @click="$bus.emit('bind-shortcut',primary,keyChar,comment)">
                Bind
            </div>
        </div>
    </div>
</template>
<style lang="scss">
    @import "../scss/_common.scss";

    .shortcut-bound, .shortcut-bind {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .shortcut-comment-link {
        color: $content-font-color;

        &:visited, &:active {
            color: $content-font-color;
        }
    }

    .shortcut-comment-input {
        width: 220px;
        height: 25px;
        margin: 5px;
        padding: 3px;
        font-size: 14px;
        border: solid #cecece 1px;

        &:focus {
            border: solid $primary-color 1px;
        }
    }
</style>
<script type="es6">
    import common from "../js/common.js";
    import ShortcutKey from "../component/ShortcutKey.vue";

    export default {
        name: 'ShortcutBoard',
        data() {
            return {
                comment: this.$background.activeTab.title.slice(0, 30),
            };
        },
        props: {
            shortcut: {
                type: Object,
                default: function() {
                    return null;
                }
            },
            keyChar: {
                type: String,
                default: function() {
                    return null;
                }
            },
            parentKeyChar: {
                type: String,
                default: function() {
                    return null;
                }
            },
        },
        components: {
            ShortcutKey,
        },
        computed: {
            // Whether is the primary shortcut
            primary: function() {
                return this.parentKeyChar === null;
            },
            shortcutDomain: function() {
                if (this.shortcut.primary) {
                    return this.shortcut.domain;
                } else {
                    return common.getHostnameFromUrl(this.shortcut.url);
                }
            },
        },
    }
</script>