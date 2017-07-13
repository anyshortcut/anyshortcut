<template>
    <section class="bind-view">
        <div>
            <p v-if="primary" class="primary-text">
                Specify the primary shortcut:
            </p>
            <div v-else>
                <p v-if="domainPrimaryShortcut"><i class="fa fa-check-square bound-icon" aria-hidden="true"></i>
                    The domain <b>{{domainPrimaryShortcut.domain}}</b>
                    already bound with <span class="shortcut">SHIFT+ALT+{{domainPrimaryShortcut.key}}</span>
                </p>
                <p class="primary-text">Specify the secondary shortcut for this domain:</p>
            </div>
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
                 @mouseover="onHoverOver">
                <div class="popper-bound" v-if="hoveredShortcut">
                    <balloon :animate="true"
                             :line="false"
                             :rotate="-50"
                             :content="keyChar">
                    </balloon>
                    <div class="popper-action">
                        <p class="primary-subtitle">{{hoveredShortcut.comment || hoveredShortcut.title}}</p>
                        <div class="shortcut-delete-button"
                             @click="handleShortcutUnbinding(hoveredShortcut);">
                            Delete
                        </div>
                    </div>
                </div>
                <div class="popper-bind" v-else>
                    Bind shortcut key!
                    <p>{{keyChar}}</p>
                    <input v-model="comment"
                           placeholder="Comment for this url"
                           maxlength="20"
                           autofocus @focus.native="$event.target.select()" required/>
                    <input @click="handleShortcutBinding(keyChar,comment)" type="button" value="Save"/>
                </div>
                <div class="popper-arrow" :class="{'cursor-pointer':highlightKey !== null}" x-arrow></div>
            </div>
        </div>

        <div v-if="primary">
            Or specify two keystroke primary key:
            <br>
            <div class="two-keystroke">
                <input class="keystroke" type="text" v-model="strokeKeyChar">
                <input class="comment" type="text" v-model="strokeComment">
                <input type="button" value="Bind" @click="handleShortcutBinding(strokeKeyChar,strokeComment)">
            </div>
        </div>

    </section>
</template>
<style lang="less">
    @import "../less/_var.less";

    .bind-view {
        display: flex;
        flex-direction: column;
        margin-top: 20px;
    }

    .popper {
        border-radius: 3px;
        background-color: #ffffff;
        width: 50%;
        box-shadow: @box-shadow-base;
        padding: 5px;
        margin-bottom: 5px;
    }

    .popper-bound {
        display: flex;
        justify-content: space-around;
    }

    .popper-action {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .popper-arrow {
        position: absolute;
        display: block;
        width: 0;
        height: 0;
        border-width: 10px;
        border-style: solid dashed dashed dashed;
        border-color: #ffffff transparent transparent transparent;
        bottom: -20px;
        left: calc(50% - 5px);
        margin-top: 0;
        margin-bottom: 0;
    }

    .cursor-pointer {
        cursor: pointer;
    }

    .two-keystroke {
        display: inline-block;

        input {
            margin: 10px;
        }

        .keystroke {
            width: 50px;
            height: 35px;
        }
    }

</style>
<script type="es6">
    import Popper from "popper";
    import Balloon from "../component/Balloon.vue";
    import Keyboard from "../component/Keyboard.vue";
    import mixin from "../js/mixin.js";

    export default{
        name: 'bind-view',
        data(){
            return {
                keyChar: null,
                comment: this.$background.activeTab.title,
                strokeKeyChar: null,
                strokeComment: null,
                showPopper: false,
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