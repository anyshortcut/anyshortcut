<template>
    <section class="primary-bind">
        <div class="primary-title">
            Specify primary shortcut
        </div>
        <keyboard :combination-key="prefs.getDefaultCombinationKey()"
                  :bound-keys="boundKeys"
                  :show-slide-keys="true"
                  :highlight-key="highlightKey"
                  @key-hover-over="onHoverOver"
                  @key-hover-leave="onHoverLeave">
        </keyboard>

        <popover :ref="'popover'"
                 :transition-name="null"
                 style="width: 50%"
                 @on-show-change="onPopoverShowChange">
            <shortcut-board :shortcut="hoveredShortcut"
                            :key-char="keyChar">
            </shortcut-board>
        </popover>
    </section>
</template>
<style lang="scss">
    .primary-bind {
        height: 300px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
</style>
<script type="es6">
    import Keyboard from "../component/Keyboard.vue";
    import Popover from "../component/Popover.vue";
    import ShortcutBoard from "../component/ShortcutBoard.vue";
    import prefs from "../js/prefs.js";

    export default {
        name: 'PrimaryBind',
        data() {
            return {
                keyChar: null,
                isPopoverShowing: false,
                prefs: prefs,
            };
        },
        props: {
            shortcuts: {
                type: Object,
                default: function() {
                    return null;
                }
            },
        },
        computed: {
            // A mouse hovered shortcut computed object
            hoveredShortcut: function() {
                return this.shortcuts[this.keyChar];
            },
            // All bound keys, for keyboard component usage.
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
        components: {
            Popover,
            Keyboard,
            ShortcutBoard,
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
            }
        }
    }
</script>