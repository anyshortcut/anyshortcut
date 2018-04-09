<template>
    <div>
        <div class="primary-title">
            Specify secondary shortcut for this domain
        </div>
        <keyboard :combination-key="prefs.getDefaultCombinationKey()"
                  :bound-keys="boundKeys"
                  :show-slide-keys="false"
                  :highlight-key="highlightKey"
                  @key-hover-over="onHoverOver"
                  @key-hover-leave="onHoverLeave">
        </keyboard>

        <popover ref="popover"
                 style="width: 280px"
                 @on-show-change="onPopoverShowChange">
            <shortcut-board :shortcut="hoveredShortcut"
                            :parent-key-char="domainShortcut.key"
                            :key-char="keyChar">
            </shortcut-board>
        </popover>
    </div>
</template>

<script>
    import Keyboard from "../component/Keyboard.vue";
    import Popover from "../component/Popover.vue";
    import ShortcutBoard from "../component/ShortcutBoard.vue";
    import prefs from "../js/prefs.js";

    export default {
        name: "SecondaryBind",
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
                default() {
                    return {};
                }
            },
            domainShortcut: {
                type: Object,
                default() {
                    return {};
                }
            }
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

<style scoped>

</style>