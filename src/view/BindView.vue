<template>
    <section class="bind-view">
        <div v-if="primary" class="primary-text margin-top-28">
            Specify primary shortcut:
        </div>
        <div v-else>
            <div v-if="domainPrimaryShortcut && showDomainBoard" class="domain-primary-bound">
                <span class="shortcut-domain">
                    <img class="shortcut-favicon"
                         :src="domainPrimaryShortcut.favicon"
                         alt="favicon"/>
                    {{domainPrimaryShortcut.domain}}
                </span>
                already bound primary shortcut
                <span class="shortcut" :title="domainPrimaryShortcut.title">{{domainPrimaryShortcut.key}}</span>

                <span class="close" @click="showDomainBoard=false">X</span>
            </div>
            <div class="margin-top-28" v-else></div>
            <div class="primary-text">Specify the secondary shortcut:</div>
        </div>

        <keyboard :bound-keys="boundKeys"
                  :highlight-key="highlightKey"
                  :primary="primary"
                  @key-hover-over="onKeyHoverOver"
                  @key-hover-leave="onHoverLeave">
        </keyboard>

        <div id="popover"
             class="popper"
             v-show="showPopper"
             @mouseover="onHoverOver"
             @mouseleave="onHoverLeave">
            <shortcut-board :shortcut="hoveredShortcut"
                            :primary="primary"
                            :key-char="keyChar">
            </shortcut-board>
            <div class="popper-arrow" :class="{'cursor-pointer':highlightKey !== null}" x-arrow></div>
        </div>
    </section>
</template>
<style lang="less">
    @import "../less/_common.less";

    .bind-view {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0 0 15px;
    }

    .popper {
        border-radius: 3px;
        background-color: #ffffff;
        width: 50%;
        box-shadow: @box-shadow-base;
        padding: 5px;
        margin-bottom: 5px;
        z-index: 999;
    }

    .popper-arrow {
        position: absolute;
        display: block;
        width: 0;
        height: 0;
        border-width: 10px;
        border-style: solid dashed dashed dashed;
        border-color: @header-bgcolor transparent transparent transparent;
        bottom: -20px;
        left: calc(50% - 5px);
        margin-top: 0;
        margin-bottom: 0;
    }

    .cursor-pointer {
        cursor: pointer;
    }

    .domain-primary-bound {
        position: relative;
        padding: 8px;
        color: #888888;
        margin: 5px;
        box-shadow: @box-shadow-base;

        .close {
            .close-button;
            position: absolute;
            right: 0;
            top: 0;
        }
    }

    .margin-top-28 {
        margin-top: 28px;
    }

</style>
<script type="es6">
    import Popper from "popper";
    import Keyboard from "../component/Keyboard.vue";
    import ShortcutBoard from "../component/ShortcutBoard.vue";
    import prefs from "../js/prefs.js";

    export default {
        name: 'bind-view',
        data() {
            return {
                keyChar: null,
                showPopper: false,
                showDomainBoard: true,
                prefs: prefs,
            };
        },
        props: {
            primary: {
                type: Boolean,
            },
            domainPrimaryShortcut: {
                type: Object,
                default: function() {
                    return {};
                }
            },
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
                if (this.showPopper && this.boundKeys.indexOf(this.keyChar) === -1) {
                    return this.keyChar;
                } else {
                    return null;
                }
            },
        },
        components: {
            Keyboard,
            ShortcutBoard,
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
        }
    }
</script>