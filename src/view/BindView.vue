<template>
    <section class="bind-view">
        <div v-if="primary" class="primary-text margin-top-28">
            Specify the primary shortcut:
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

        <div>
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
                <div class="popper-bound" v-if="hoveredShortcut">
                    <div class="shortcut-domain">
                        <img class="shortcut-favicon"
                             :src="hoveredShortcut.favicon"
                             @loadstart="$event.target.src=null"
                             alt="favicon"/>
                        {{hoveredShortcutDomain}}
                    </div>
                    <p class="primary-subtitle">{{hoveredShortcut.comment || hoveredShortcut.title}}</p>
                    <div class="shortcut-delete-button"
                         @click="handleShortcutUnbinding(hoveredShortcut);">
                        Delete
                    </div>
                </div>
                <div class="popper-bind" v-else>
                    <label for="comment">Input comment for the shortcut</label>
                    <input id="comment"
                           class="shortcut-comment-input"
                           v-model="comment"
                           placeholder="Comment for this url"
                           maxlength="50"
                           autofocus @focus.native="$event.target.select()" required/>
                    <div class="shortcut-bind-button"
                         @click="handleShortcutBinding(keyChar,comment)">
                        Bind
                    </div>
                </div>
                <div class="popper-arrow" :class="{'cursor-pointer':highlightKey !== null}" x-arrow></div>
            </div>
        </div>

        <compound-bind v-if="primary && prefs.isCompoundShortcutEnable()"
                       @bind-compound-shortcut="handleShortcutBinding">
        </compound-bind>

    </section>
</template>
<style lang="less">
    @import "../less/_common.less";

    .bind-view {
        display: flex;
        flex-direction: column;
    }

    .popper {
        border-radius: 3px;
        background-color: #ffffff;
        width: 50%;
        box-shadow: @box-shadow-base;
        padding: 5px;
        margin-bottom: 5px;
    }

    .popper-bound, .popper-bind {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .shortcut-comment-input {
        width: 220px;
        height: 25px;
        margin: 3px;
        padding: 3px;
        font-size: 14px;
        color: @secondary-color;
        border: solid #cecece 1px;

        &:focus {
            border: solid @primary-color 1px;
        }
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
    import Balloon from "../component/Balloon.vue";
    import Keyboard from "../component/Keyboard.vue";
    import CompoundBind from "../component/CompoundBind.vue";
    import mixin from "../js/mixin.js";
    import common from "../js/common.js";
    import prefs from "../js/prefs.js";

    export default {
        name: 'bind-view',
        data() {
            return {
                keyChar: null,
                comment: this.$background.activeTab.title,
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
                },
            },
            shortcuts: {
                type: Object,
                default: function() {
                    return null;
                }
            }
        },
        computed: {
            // A mouse hovered shortcut computed object
            hoveredShortcut: function() {
                return this.shortcuts[this.keyChar];
            },
            hoveredShortcutDomain: function() {
                if (this.hoveredShortcut.primary) {
                    return this.hoveredShortcut.domain;
                } else {
                    return common.getHostnameFromUrl(this.hoveredShortcut.url);
                }
            },
            // All bound keys, for keyboard component usage.
            boundKeys: function() {
                return this.shortcuts ? Object.keys(this.shortcuts) : [];
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
            Balloon,
            CompoundBind,
        },
        mixins: [mixin],
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
                    this.keyChar = null;
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