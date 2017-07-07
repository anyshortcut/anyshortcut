<template>
    <section class="bind-view">
        <div>
            <p v-if="primary">
                Specify the primary shortcut:
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
                      :show-indicator="showPopper"
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
                    <button @click="handleShortcutUnbinding(hoveredShortcut)">Delete?</button>
                </div>
                <div v-else>
                    Bind shortcut key!
                    <p>{{keyChar}}</p>
                    <input v-model="comment"
                           placeholder="Comment for this url"
                           maxlength="20"
                           autofocus @focus.native="$event.target.select()" required/>
                    <br>
                    <input @click="handleShortcutBinding(keyChar,comment)" type="button" value="Save"/>
                </div>
                <div class="popper-arrow" x-arrow></div>
            </div>
        </div>

        <br>

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
    }

    #popover {
        border-radius: 3px;
        background-color: #ffffff;
        width: 50%;
        box-shadow: @box-shadow-base;
        padding: 5px;
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
        },
        components: {
            Keyboard,
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
                    this.key = null;
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