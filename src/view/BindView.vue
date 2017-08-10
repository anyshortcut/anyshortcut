<template>
    <section class="bind-view">
        <div v-if="primary" class="primary-title">
            Specify primary shortcut
        </div>
        <template v-else>
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
            <div class="primary-title">Specify the secondary shortcut</div>
        </template>

        <keyboard :bound-keys="boundKeys"
                  :highlight-key="highlightKey"
                  :primary="primary"
                  @key-hover-over="onHoverOver"
                  @key-hover-leave="onHoverLeave">
        </keyboard>

        <popover ref="popover"
                 style="width: 50%"
                 @on-show-change="onPopoverShowChange">
            <shortcut-board :shortcut="hoveredShortcut"
                            :primary="primary"
                            :key-char="keyChar">
            </shortcut-board>
        </popover>

        <a v-if="primary && prefs.isCompoundShortcutEnable()"
           class="bind-compound-link"
           href="#/compound-bind">
            Bind compound shortcut<span><img src="../img/right-arrow.svg"></span>
        </a>

    </section>
</template>
<style lang="less">
    @import "../less/_common.less";

    .bind-view {
        display: flex;
        flex-direction: column;
        padding: 10px 0;
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

    .bind-compound-link {
        font-size: 15px;
        color: #515151;
        margin-bottom: 10px;

        img {
            margin: 0 0 0 10px;
            vertical-align: middle;
        }
    }

</style>
<script type="es6">
    import Keyboard from "../component/Keyboard.vue";
    import Popover from "../component/Popover.vue";
    import ShortcutBoard from "../component/ShortcutBoard.vue";
    import prefs from "../js/prefs.js";

    export default {
        name: 'bind-view',
        data() {
            return {
                keyChar: null,
                isPopoverShowing: false,
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