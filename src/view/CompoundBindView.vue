<template>
    <div class="compound-bind-view">
        <header class="compound-bind-header">
            <a href="#/main"><img src="../img/back.svg" class="back-icon"/></a>
            Go back
        </header>

        <div class="primary-title"
             style="margin-bottom: -10px;">
            Specify primary compound key
        </div>
        <compound-keyboard
                :bound-keys="boundKeys"
                :highlight-key="highlightKey"
                @on-table-scroll="$refs.popover.dismiss()"
                @key-hover-over="onHoverOver"
                @key-hover-leave="onHoverLeave">
        </compound-keyboard>

        <popover ref="popover"
                 style="width: 50%"
                 @on-show-change="onPopoverShowChange">
            <shortcut-board :shortcut="hoveredShortcut"
                            :key-char="keyChar">
            </shortcut-board>
        </popover>
    </div>
</template>
<style lang="less">
    @import "../less/_common.less";

    .compound-bind-view {
        width: 560px;
        display: flex;
        flex-direction: column;
        background: @content-bgcolor;
    }

    .compound-bind-header {
        .header;
        justify-content: flex-start;
    }

</style>
<script type="es6">
    import _ from "lodash";
    import Popover from "../component/Popover.vue";
    import CompoundKeyboard from "../component/CompoundKeyboard.vue";
    import ShortcutBoard from "../component/ShortcutBoard.vue";

    export default {
        name: 'CompoundBindView',
        data() {
            return {
                keyChar: null,
                shortcuts: [],
                isPopoverShowing: false,
            }
        },
        components: {
            CompoundKeyboard,
            ShortcutBoard,
            Popover,
        },
        computed: {
            // A mouse hovered shortcut computed object
            hoveredShortcut: function() {
                return this.shortcuts[this.keyChar];
            },
            boundKeys: function() {
                return Object.keys(this.shortcuts);
            },
            highlightKey: function() {
                if (this.isPopoverShowing && this.boundKeys.indexOf(this.keyChar) === -1) {
                    return this.keyChar;
                } else {
                    return null;
                }
            },
        },
        methods: {
            onHoverOver: function(target) {
                this.keyChar = target.innerText;
                this.$refs.popover.render(target);
            },
            onHoverLeave: function() {
                this.$refs.popover.hidden();
            },
            onPopoverShowChange: function(showing) {
                this.isPopoverShowing = showing;
            },
            queryShortcuts: function() {
                this.shortcuts = _.pickBy(this.$background.primaryShortcuts, (value, key) => {
                    return key.length === 2;
                });
            }
        },
        created: function() {
            this.queryShortcuts();
        },
    }
</script>