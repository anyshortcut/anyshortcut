<template>
    <section class="bind-view">
        <div v-if="primary" class="primary-title">
            Specify primary shortcut
        </div>
        <template v-else>
            <div class="domain-primary-bound">
                <span class="shortcut-domain">
                    <img class="shortcut-favicon"
                         :src="domainPrimaryShortcut.favicon"
                         alt=""/>
                    {{domainPrimaryShortcut.domain}}
                </span>
                already bound primary shortcut
                <div class="shortcut"
                     style="display: inline-block"
                     :title="domainPrimaryShortcut.title">
                    ALT + {{domainPrimaryShortcut.key}}
                </div>
            </div>
            <div class="primary-title">Specify the secondary shortcut</div>
        </template>

        <keyboard :combination-key="prefs.getDefaultCombinationKey()"
                  :bound-keys="boundKeys"
                  :show-slide-keys="primary"
                  :highlight-key="highlightKey"
                  @key-hover-over="onHoverOver"
                  @key-hover-leave="onHoverLeave">
        </keyboard>

        <popover ref="popover"
                 style="width: 50%"
                 @on-show-change="onPopoverShowChange">
            <shortcut-board :shortcut="hoveredShortcut"
                            :parent-key-char="primary?null:domainPrimaryShortcut.key"
                            :key-char="keyChar">
            </shortcut-board>
        </popover>


        <template v-if="!primary && Object.keys(shortcuts).length">
            <div>Secondary shortcuts</div>
            <shortcut-list style="width:380px;" :shortcuts="shortcuts"></shortcut-list>
        </template>

    </section>
</template>
<style lang="scss">
    @import "../scss/_common.scss";

    .bind-view {
        display: flex;
        flex-direction: column;
        padding: 10px 0;
    }

    .domain-primary-bound {
        position: relative;
        padding: 8px;
        font-weight: 600;
        color: #333;
        margin: 5px 15px;

        .close {
            color: #CECECE;
            padding: 10px;
            background-color: transparent;
            border: none;
            cursor: pointer;
            outline: none;
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
    import ShortcutList from "../component/ShortcutList.vue";
    import prefs from "../js/prefs.js";

    export default {
        name: 'bind-view',
        data() {
            return {
                keyChar: null,
                isPopoverShowing: false,
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
            ShortcutList,
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