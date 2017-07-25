<template>
    <div class="popper-bound" v-if="shortcut">
        <div class="shortcut-domain">
            <img class="shortcut-favicon"
                 :src="shortcut.favicon"
                 @loadstart="$event.target.src=null"
                 alt="favicon"/>
            {{ shortcutDomain }}
        </div>
        <p class="primary-subtitle">{{shortcut.comment || shortcut.title}}</p>
        <div class="shortcut-delete-button"
             @click="$bus.emit('unbind-shortcut',shortcut)">
            Delete
        </div>
    </div>
    <div class="popper-bind" v-else>
        <label for="comment">Input comment for the shortcut</label>
        <input id="comment"
               class="shortcut-comment-input"
               v-model="comment"
               placeholder="Comment for this url"
               maxlength="50"
               autofocus @focus.native="$event.target.select()" required/>
        <div class="shortcut-bind-button"
             @click="$bus.emit('bind-shortcut',primary,keyChar,comment)">
            Bind
        </div>
    </div>
</template>
<style lang="less">
    @import "../less/_common.less";

    .popper-bound, .popper-bind {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .shortcut-comment-input {
        width: 220px;
        height: 25px;
        margin: 3px;
        padding: 3px;
        font-size: 14px;
        color: @secondary-color;
        border: solid #cecece 1px;

        &:focus {
            border: solid @primary-color 1px;
        }
    }
</style>
<script type="es6">
    import common from "../js/common.js";

    export default {
        name: 'ShortcutBoard',
        data() {
            return {
                comment: this.$background.activeTab.title,
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
            primary: {
                type: Boolean,
                default: function() {
                    return true;
                }
            },
        },
        computed: {
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