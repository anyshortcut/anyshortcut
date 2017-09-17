<template>
    <div class="keyboard">
        <div class="keyboard-row">
            <div class="key weak" v-visible="weakVisibility"></div>
            <div v-for="key in '1234567890'"
                 :class="keyClass(key)"
                 class="key">{{ key }}
            </div>
            <div class="key weak invisible" v-visible="weakVisibility"></div>
        </div>
        <div class="keyboard-row">
            <div class="key weak" v-visible="weakVisibility"></div>
            <div v-for="key in 'QWERTYUIOP'"
                 :class="keyClass(key)"
                 class="key">{{ key }}
            </div>
            <div class="key weak invisible" v-visible="weakVisibility"></div>
        </div>
        <div class="keyboard-row">
            <div class="key weak extra-size-two" v-visible="weakVisibility"></div>
            <div v-for="key in 'ASDFGHJKL'"
                 :class="keyClass(key)"
                 class="key">{{ key }}
            </div>
            <div class="key weak extra-size-two invisible"
                 v-visible="weakVisibility">
            </div>
        </div>
        <div class="keyboard-row">
            <div class="key weak double-size lowercase"
                 v-visible="weakVisibility"
                 :class="{highlight:primary,shift:primary}">
            </div>
            <div v-for="key in 'ZXCVBNM'"
                 :class="keyClass(key)"
                 class="key">{{ key }}
            </div>
            <div class="key weak double-size lowercase invisible"
                 v-visible="weakVisibility"
                 :class="{highlight:primary,shift:primary}">
            </div>
        </div>
        <div class="keyboard-row">
            <div class="key weak lowercase" v-visible="weakVisibility">
            </div>
            <div class="key weak lower-center lowercase highlight"
                 v-visible="weakVisibility">alt
            </div>
            <div class="key weak lower-center lowercase extra-size-two invisible"
                 v-visible="weakVisibility">
            </div>
            <div class="key weak space-bar invisible"
                 v-visible="weakVisibility">
            </div>
            <div class="key weak lower-center lowercase extra-size-two"
                 v-visible="weakVisibility">
            </div>
            <div class="key weak lower-center lowercase highlight invisible"
                 v-visible="weakVisibility">alt
            </div>
            <div class="key weak lowercase invisible"
                 v-visible="weakVisibility">
            </div>
        </div>
    </div>
</template>
<style lang="less">
    * {
        box-sizing: border-box;
    }

    .keyboard {
        max-width: 500px;
        margin: 5px auto;
    }

    .keyboard-row {
        display: flex;
    }

    .key {
        position: relative;
        display: inline-block;
        vertical-align: middle;
        text-align: center;
        height: 30px;
        width: 30px;
        margin: 6px;
        letter-spacing: 0.5px;
        color: #3a3a3a;
        background: #ffffff;
        flex: 1;
        border-style: solid;
        border-width: 1px;
        border-color: #E5E5E5;
        border-radius: 3px;
        text-transform: uppercase;
        font-size: 15px;
        white-space: nowrap;
        overflow: hidden;
        cursor: pointer;

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

        &.lower-center {
            vertical-align: bottom;
        }

        &.space-bar {
            flex: 5.0;
        }

        &.weak {
            visibility: hidden;
            background-color: #f7f7f7;
            border: none;
            box-shadow: none;
            cursor: text;
        }

        &.shift::after {
            content: 'shift';
        }

        &.highlight {
            background: #E9EDFB;
            color: #4F6EC8;
            font-weight: 500;
            box-shadow: none;
        }

        &.invisible {
            visibility: hidden;
        }

        &.disabled {
            background: #ececec;
            cursor: text;
        }

    }
</style>
<script type="es6">
    export default {
        name: 'Keyboard',
        data() {
            return {}
        },
        props: {
            boundKeys: {
                type: Array,
                default: function() {
                    return [];
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
        computed: {
            weakVisibility: function() {
                return this.highlightKey !== null;
            }
        },
        methods: {
            onKeyClick: function(event) {
                //What difference between e.currentTarget and e.target,
                // refer to http://jsfiddle.net/misteroneill/kmn4A/3/
                this.$emit('key-changed', event.target.innerText);
            },
            keyClass: function(key) {
                return this.boundKeys.indexOf(key) !== -1 ? {
                    'disabled': true
                } : {
                    'highlight': key === this.highlightKey
                };
            }
        },
        mounted: function() {
            // Query key elements exclude weak element, then add mouse event listener.
            this.$el.querySelectorAll('.key:not(.weak)').forEach(element => {
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