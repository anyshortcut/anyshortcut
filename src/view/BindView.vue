<template>
    <section class="bind-view">
        <div>
            <p v-if="primary">
                Specify the shortcut:
            </p>
            <div v-else>
                <p v-if="domainPrimaryShortcut">
                    The domain <b>{{domainPrimaryShortcut.domain}}</b>
                    already bound with <span class="shortcut">SHIFT+ALT+{{domainPrimaryShortcut.key}}</span>
                </p>
                Specify the secondary shortcut for this domain:
            </div>
            <br>
        </div>

        <div>
            <keyboard :bound-keys="boundKeys"
                      @key-hover-over="onKeyHoverOver"
                      @key-hover-leave="onHoverLeave">
            </keyboard>
            <div id="popover"
                 v-show="showPopper"
                 @mouseover="onHoverOver"
                 @mouseleave="onHoverLeave">
                <div v-if="hoveredShortcut">
                    <p>{{keyChar}}</p>
                    <p>{{hoveredShortcut.comment || hoveredShortcut.title}}</p>
                    <button @click="handleShortcutUnbinding">Delete?</button>
                </div>
                <div v-else>
                    Bind shortcut key!
                    <p>{{keyChar}}</p>
                    <input v-model="comment"
                           placeholder="Comment for this url"
                           maxlength="20"
                           autofocus @focus.native="$event.target.select()" required/>
                    <br>
                    <input @click="handleShortcutBinding" type="button" value="Save"/>
                </div>
            </div>
        </div>

        <br>

        <div v-if="primary">
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
    @import "../less/_var.less";

    .bind-view {
        display: flex;
        flex-direction: column;
    }

    #popover {
        border-radius: 3px;
        background-color: #ffffff;
        width: 50%;
        box-shadow: @box-shadow-base;
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

    export default{
        name: 'bind-view',
        data(){
            return {
                keyChar: null,
                comment: null,
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
                if (this.boundKeys && this.boundKeys.indexOf(this.keyChar) !== -1) {
                    return this.shortcuts[this.keyChar];
                } else {
                    return null;
                }
            },
            // All bound keys, for keyboard component usage.
            boundKeys: function() {
                console.log('computed property boundKeys called');
                if (this.shortcuts) {
                    return Object.keys(this.shortcuts);
                } else {
                    return [];
                }
            },
            tabTitle: function() {
                console.log('compute tabTitle:', this.$background.activeTab.title);
                return this.$background.activeTab.title;
            }
        },
        components: {
            Keyboard,
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
            handleShortcutBinding: function() {
                let bindFunction;
                if (this.primary) {
                    bindFunction = this.$background.bindPrimaryShortcut;
                } else {
                    bindFunction = this.$background.bindSecondaryShortcut;
                }

                this.$emit('pre-bind');
                bindFunction(this.keyChar, this.comment, result => {
                    this.$emit('post-bind', result);
                });
            },
            bindKeystrokeShortcut: function() {
                this.handleShortcutBinding(this.strokeKeyChar, this.strokeComment);
            },
            handleShortcutUnbinding: function() {
                if (this.hoveredShortcut) {
                    let removeFunction;
                    if (this.hoveredShortcut.primary) {
                        removeFunction = this.$background.removePrimaryShortcut;
                    } else {
                        removeFunction = this.$background.removeSecondaryShortcut;
                    }

                    this.$emit('pre-unbind');
                    removeFunction(this.hoveredShortcut, result => {
                        this.$emit('post-unbind', result);
                    });
                }
            },
        }
    }
</script>