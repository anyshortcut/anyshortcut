<template>
    <div class="secondary-bind">
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

        <popover :ref="'popover'"
                 :transition-name="null"
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
    import KeyboardBind from "./mixin-keyboard-bind.js";
    import prefs from "../js/prefs.js";

    export default {
        name: "SecondaryBind",
        data() {
            return {
                prefs: prefs,
            };
        },
        props: {
            domainShortcut: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        components: {
            Keyboard,
        },
        mixins: [KeyboardBind],
    }
</script>

<style scoped>
    .secondary-bind {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        height: 300px
    }
</style>