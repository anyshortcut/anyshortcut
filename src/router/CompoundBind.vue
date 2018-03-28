<template>
    <div class="compound-bind-view">
        <header class="compound-bind-header">
            <img @click="$router.go(-1)" style="cursor: pointer" src="../img/back.svg" class="back-icon"/>
            Go back
        </header>

        <div style="margin-top: 10px;">
            <span class="primary-title">
                  Specify primary compound key
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

    .compound-bind-header {
        @include header;
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
                this.shortcuts = _.pickBy(_.cloneDeep(this.$background.primaryShortcuts), (value, key) => {
                    return key.length === 2;
                });
            }
        },
        created: function() {
            this.queryShortcuts();
        },
        mounted() {
            this.$bus.on('refresh-compound-view', () => {
                this.queryShortcuts();
            });
        },
    }
</script>