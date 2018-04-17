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
    import prefs from "../js/prefs.js";
    import KeyboardBind from "./mixin-keyboard-bind.js";

    export default {
        name: 'PrimaryBind',
        data() {
            return {
                prefs: prefs,
            };
        },
        components: {
            Keyboard,
        },
        mixins: [KeyboardBind],
    }
</script>