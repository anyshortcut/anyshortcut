<template>
    <div class="compound-bind-view">
        <div>
            <span class="primary-title">
                  Specify compound shortcut
            </span>
            <span data-balloon="Press key to auto-navigate the data grid"
                  data-balloon-pos="up">
                <img id="tooltip-compound-shortcut-filter" class="info-img" src="../img/info-grey.svg" alt="info">
            </span>
        </div>

        <compound-keyboard
                :bound-keys="boundKeys"
                :highlight-key="highlightKey"
                @on-table-scroll="$refs.popover.dismiss()"
                @key-hover-over="onHoverOver"
                @key-hover-leave="onHoverLeave">
        </compound-keyboard>

        <popover ref="popover"
                 :transition-name="null"
                 style="width: 50%"
                 @on-show-change="onPopoverShowChange">
            <shortcut-board :shortcut="hoveredShortcut"
                            :key-char="keyChar">
            </shortcut-board>
        </popover>
    </div>
</template>
<style lang="scss">
    @import "../scss/common";

    .compound-bind-view {
        width: 560px;
        display: flex;
        flex-direction: column;
        background: $content-bgcolor;
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
                isPopoverShowing: false,
            }
        },
        props: {
            shortcuts: {
                type: Object,
                default: function() {
                    return null;
                }
            },
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
        },
    }
</script>