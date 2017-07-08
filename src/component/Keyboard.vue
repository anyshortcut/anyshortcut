<template>
    <div class="container">
        <div class="keyboard">
            <div class="keyboard-row">
                <div class="key weak" v-visible="showIndicator">`</div>
                <div v-for="key in '1234567890'"
                     :class="keyClass(key)"
                     class="key number">{{ key }}
                </div>
                <div class="key weak invisible"></div>
            </div>
            <div class="keyboard-row">
                <div class="key weak" v-visible="showIndicator">↹</div>
                <div v-for="key in 'QWERTYUIOP'"
                     :class="keyClass(key)"
                     class="key">{{ key }}
                </div>
                <div class="key weak invisible"></div>
            </div>
            <div class="keyboard-row">
                <div class="key weak extra-size-two" v-visible="showIndicator">⇪</div>
                <div v-for="key in 'ASDFGHJKL'"
                     :class="keyClass(key)"
                     class="key">{{ key }}
                </div>
                <div class="key weak extra-size-two invisible"></div>
            </div>
            <div class="keyboard-row">
                <div class="key weak double-size lowercase lower-left"
                     v-visible="showIndicator"
                     :class="{highlight:primary}">shift
                </div>
                <div v-for="key in 'ZXCVBNM'"
                     :class="keyClass(key)"
                     class="key">{{ key }}
                </div>
                <div class="key weak double-size lowercase lower-right invisible">shift
                </div>
            </div>
            <div class="keyboard-row">
                <div class="key weak lower-left lowercase" v-visible="showIndicator">ctrl
                </div>
                <div class="key weak lower-center lowercase highlight"
                     v-visible="showIndicator">alt
                </div>
                <div class="key weak lower-center lowercase extra-size-two invisible"
                     v-visible="showIndicator">&#8984;
                </div>
                <div class="key weak space-bar invisible"
                     v-visible="showIndicator"></div>
                <div class="key weak lower-center lowercase extra-size-two"
                     v-visible="showIndicator">&#8984;
                </div>
                <div class="key weak lower-center lowercase highlight invisible">alt
                </div>
                <div class="key weak lower-right lowercase invisible">ctrl
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="less">
    * {
        box-sizing: border-box;
    }

    .container {
        max-width: 480px;
        margin: 5px auto;
    }

    .keyboard-row {
        display: flex;
    }

    @key-height: 35px;
    .key {
        position: relative;
        display: inline-block;
        vertical-align: middle;
        text-align: center;
        padding: 3px 2px;
        height: @key-height;
        margin: 4px;
        letter-spacing: 0.5px;
        color: #3a3a3a;
        background-color: #ffffff;
        flex: 1;
        box-shadow: inset 0 -2px 0 #aaaaaa,
        inset 0px 1px 1px -1px #fff,
        0px 1px 1px 0px #7a7a7a;
        border-radius: 3px;
        text-transform: uppercase;
        font-size: 14px;
        line-height: 1.3;
        white-space: nowrap;
        overflow: hidden;

        span {
            display: inline-block;
            vertical-align: middle;
        }

        &::before {
            display: inline-block;
            vertical-align: middle;
            height: 100%;
            content: '';
        }

        &:hover {
            position: relative;
            top: 1px;
            left: 1px;
            cursor: pointer;
        }

        &.number {
            margin: 4px 5px;
        }

        &.extra-size {
            flex: 1.25;
        }
        &.extra-size-two {
            flex: 1.625;
        }
        &.double-size {
            flex: 2.125;
        }

        &.lowercase {
            font-size: 11px;
            text-transform: lowercase;
        }

        &.lower-right {
            vertical-align: bottom;
            text-align: right;
            padding-right: 5px;
        }
        &.lower-left {
            vertical-align: bottom;
            text-align: left;
            padding-left: 5px;
        }
        &.lower-center {
            vertical-align: bottom;
        }

        &.space-bar {
            flex: 5.0;
        }

        &.weak {
            visibility: hidden;
            background-color: #f7f7f7;
            border-width: 1px;
            border-style: dashed;
            box-shadow: none;
            cursor: text;
        }

        &.highlight {
            border-color: #dd4814;
            color: #dd4814;
            border-width: 1.2px;
            box-shadow: inset 0 -2px 0 #dd4814,
            inset 0px 1px 1px -1px #fff,
            0px 1px 1px 0px #dd4814;
        }

        &.invisible {
            visibility: hidden;
        }

        &.disabled {
            background: #cccccc;
            cursor: text;
        }

    }
</style>
<script type="es6">
    export default{
        name: 'Keyboard',
        data(){
            return {}
        },
        props: {
            boundKeys: {
                type: Array,
                default: function() {
                    return [];
                }
            },
            showIndicator: {
                type: Boolean,
                default: function() {
                    return false;
                }
            },
            highlightKey: {
                type: String,
                default: function() {
                    return null;
                }
            },
            primary: {
                type: Boolean,
                default: function() {
                    return true;
                }
            },
        },
        directives: {
            visible: {
                update: function(el, binding) {
                    if (binding.value) {
                        el.style.visibility = 'visible';
                    } else {
                        el.style.visibility = 'hidden';
                    }
                }
            }
        },
        methods: {
            onKeyClick: function(event) {
                //What difference between e.currentTarget and e.target,
                // refer to http://jsfiddle.net/misteroneill/kmn4A/3/
                this.$emit('key-changed', event.target.innerText);
            },
            keyClass: function(key) {
                return {
                    'highlight': key === this.highlightKey,
                    'disabled': this.boundKeys && this.boundKeys.indexOf(key) !== -1
                };
            }
        },
        mounted: function() {
            // Query key elements exclude weak element, then add mouse event listener.
            document.querySelectorAll('.key:not(.weak)').forEach(element => {
                element.addEventListener('mouseover', () => {
                    this.$emit('key-hover-over', element);
                });
                element.addEventListener('mouseleave', () => {
                    this.$emit('key-hover-leave', element);
                });
            });
        },
    }
</script>