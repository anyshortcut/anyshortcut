<template>
    <div class="compound-bind-view">
        <div class="primary-text">Specify primary compound key:</div>
        <compound-keyboard
                :bound-keys="boundKeys"
                @key-hover-over="onKeyHoverOver"
                @key-hover-leave="onHoverLeave">
        </compound-keyboard>

        <div id="popover"
             class="popper"
             v-show="showPopper"
             @mouseover="onHoverOver"
             @mouseleave="onHoverLeave">
            <shortcut-board :shortcut="hoveredShortcut"
                            :primary="true"
                            :key-char="keyChar">
            </shortcut-board>
            <div class="popper-arrow" :class="{'cursor-pointer':highlightKey !== null}" x-arrow></div>
        </div>
    </div>
</template>
<style lang="less">

</style>
<script type="es6">
    import _ from "lodash";
    import Popper from "popper";
    import CompoundKeyboard from "../component/CompoundKeyboard.vue";
    import ShortcutBoard from "../component/ShortcutBoard.vue";

    export default {
        name: 'CompoundBindView',
        data() {
            return {
                keyChar: null,
                shortcuts: [],
                showPopper: false,
            }
        },
        components: {
            CompoundKeyboard,
            ShortcutBoard,
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
                if (this.showPopper && this.boundKeys.indexOf(this.keyChar) === -1) {
                    return this.keyChar;
                } else {
                    return null;
                }
            },
        },
        methods: {
            onKeyHoverOver: function(target) {
                this.onHoverOver();
                this.keyChar = target.innerText;
                new Popper(target, document.querySelector("#popover"), {
                    placement: "top"
                });
            },
            onHoverLeave: function() {
                this._timeoutId = setTimeout(() => {
                    this.showPopper = false;
                }, 200);
            },
            onHoverOver: function() {
                this.showPopper = true;
                clearTimeout(this._timeoutId);
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