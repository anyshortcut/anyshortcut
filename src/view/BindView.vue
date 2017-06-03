<template>
    <section class="pure-g">
        <div class="pure-u-1">
            <p v-if="primary">
                Specify the shortcut:
            </p>
            <div v-else>
                <p v-if="domainPrimaryShortcut">
                    The domain <b>{{domainPrimaryShortcut.domain}}</b>
                    already bound with <b>SHIFT+ALT+{{domainPrimaryShortcut.key}}</b>
                </p>
                Specify the secondary shortcut for this domain:
            </div>
            <br>
        </div>

        <div class="pure-u-1 is-center">
            <keyboard :bound-keys="boundKeys"
                      @key-hover-over="onKeyHoverOver"
                      @key-hover-leave="onHoverLeave">
            </keyboard>
            <popover id="popover"
                     v-show="showPopper"
                     :key-char="keyChar"
                     :tab-title="tabTitle"
                     :shortcut="hoveredShortcut"
                     @mouseover.native="onHoverOver"
                     @mouseleave.native="onHoverLeave"
                     @bind-click="handleShortcutBinding">
            </popover>
        </div>

        <br>

        <div class="pure-u-1 is-center" v-if="primary">
            Or specify two keystroke primary key:
            <br>
            <div class="two-keystroke">
                <input class="keystroke" type="text" v-model="strokeKeyChar">
                <input class="comment" type="text" v-model="strokeComment">
                <input type="button" value="Bind" @click="bindKeystrokeShortcut">
            </div>
        </div>

    </section>
</template>
<style lang="less">
    #popover {
        border: 2px #dd4814;
        background-color: #ffffff;
        width: 50%;
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
    import Keyboard from "../component/Keyboard.vue";
    import Popover from "../component/Popover.vue";

    export default{
        name: 'bind-view',
        data(){
            return {
                keyChar: null,
                strokeKeyChar: null,
                strokeComment: null,
                boundKeys: [],// All bound keys, for keyboard component usage.
                tabTitle: null,
                showPopper: false,
            };
        },
        props: {
            tab: {
                type: Object
            },
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
                if (this.boundKeys && this.boundKeys.indexOf(this.keyChar) !== -1) {
                    return this.shortcuts[this.keyChar];
                } else {
                    return null;
                }
            }
        },
        watch: {
            shortcuts: function(newValue) {
                this.boundKeys = Object.keys(newValue);
            },
            tab: function(newValue) {
                this.tabTitle = newValue.title;
            }
        },
        components: {
            Keyboard,
            Popover,
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
                    this.key = null;
                    this.showPopper = false;
                }, 200);
            },
            onHoverOver: function() {
                this.showPopper = true;
                clearTimeout(this._timeoutId);
            },
            handleShortcutBinding: function(keyChar, comment, forceBinding) {
                this.forceBinding = forceBinding;

                let bindFunction;
                if (this.primary) {
                    bindFunction = this.$background.bindPrimaryShortcut;
                } else {
                    bindFunction = this.$background.bindSecondaryShortcut;
                }

                this.$emit('pre-bind');
                bindFunction(keyChar, comment, this.tab, forceBinding, result => {
                    this.$emit('post-bind', result);
                });
            },
            bindKeystrokeShortcut: function() {
                this.$emit('pre-bind');
                this.$background.bindPrimaryShortcut(this.strokeKeyChar, this.strokeComment, this.tab, false, result => {
                    this.$emit('post-bind', result);
                });
            },
        }
    }
</script>