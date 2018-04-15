<template>
    <div class="keyboard">
        <div class="keyboard-row">
            <div class="key slide-key" v-visible="slideKeyVisibility"></div>
            <div v-for="key in '1234567890'"
                 :class="keyClass(key)"
                 class="key">{{ key }}
            </div>
            <div class="key slide-key" v-visible="slideKeyVisibility"></div>
        </div>
        <div class="keyboard-row">
            <div class="key slide-key" v-visible="slideKeyVisibility"></div>
            <div v-for="key in 'QWERTYUIOP'"
                 :class="keyClass(key)"
                 class="key">{{ key }}
            </div>
            <div class="key slide-key" v-visible="slideKeyVisibility"></div>
        </div>
        <div class="keyboard-row">
            <div class="key slide-key extra-size-two" v-visible="slideKeyVisibility">
            </div>
            <div v-for="key in 'ASDFGHJKL'"
                 :class="keyClass(key)"
                 class="key">{{ key }}
            </div>
            <div class="key slide-key extra-size-two"
                 v-visible="slideKeyVisibility">
            </div>
        </div>
        <div class="keyboard-row">
            <div class="key slide-key double-size lowercase"
                 :class="{highlight:combinationKey==='shift'}"
                 v-visible="slideKeyVisibility">
                {{ combinationKey==='shift'?'shift':'' }}
            </div>
            <div v-for="key in 'ZXCVBNM'"
                 :class="keyClass(key)"
                 class="key">{{ key }}
            </div>
            <div class="key slide-key" v-visible="slideKeyVisibility"></div>
            <div class="key slide-key double-size lowercase"
                 :class="{highlight:combinationKey==='shift'}"
                 v-visible="slideKeyVisibility">
                {{ combinationKey==='shift'?'shift':'' }}
            </div>
        </div>
        <div class="keyboard-row">
            <div class="key slide-key lowercase" v-visible="slideKeyVisibility">
            </div>
            <div class="key slide-key lower-center lowercase"
                 :class="{highlight:combinationKey==='alt'}"
                 v-visible="slideKeyVisibility">
                {{ combinationKey==='alt'?'alt':'' }}
            </div>
            <div class="key slide-key lower-center lowercase extra-size-two"
                 v-visible="slideKeyVisibility">
            </div>
            <div class="key slide-key space-bar"
                 v-visible="slideKeyVisibility">
            </div>
            <div class="key slide-key lower-center lowercase extra-size-two"
                 v-visible="slideKeyVisibility">
            </div>
            <div class="key slide-key lower-center lowercase"
                 :class="{highlight:combinationKey==='alt'}"
                 v-visible="slideKeyVisibility">
                {{ combinationKey==='alt'?'alt':'' }}
            </div>
            <div class="key slide-key lowercase"
                 v-visible="slideKeyVisibility">
            </div>
        </div>
    </div>
</template>
<style lang="scss">
    @import "../scss/_keyboard.scss";

    .keyboard {
        max-width: 500px;
        margin: 5px auto 0;
    }

    .keyboard-row {
        display: flex;
    }

    .key {
        position: relative;
        display: inline-block;
        vertical-align: middle;
        height: 30px;
        width: 30px;
        margin: 6px;
        letter-spacing: 0.5px;
        flex: 1;
        font-size: 15px;
        white-space: nowrap;
        overflow: hidden;

        &::before {
            display: inline-block;
            vertical-align: middle;
            height: 100%;
            content: '';
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

        &.slide-key {
            visibility: hidden;
            background-color: #f7f7f7;
            border: none;
            box-shadow: none;
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
            combinationKey: {
                type: String,
                default() {
                    return 'alt';
                }
            },
            boundKeys: {
                type: Array,
                default: function() {
                    return [];
                }
            },
            showSlideKeys: {
                type: Boolean,
                default: function() {
                    return true;
                }
            },
            highlightKey: {
                type: String,
                default: function() {
                    return null;
                }
            },
        },
        computed: {
            slideKeyVisibility: function() {
                return this.showSlideKeys && this.highlightKey !== null;
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
                    'occupied': true
                } : {
                    'highlight': key === this.highlightKey
                };
            }
        },
        mounted: function() {
            // Query key elements exclude slide key element, then add mouse event listener.
            this.$el.querySelectorAll('.key:not(.slide-key)').forEach(element => {
                element.addEventListener('mouseenter', () => {
                    this.$emit('key-hover-over', element);
                });
                element.addEventListener('mouseleave', () => {
                    this.$emit('key-hover-leave', element);
                });
            });
        },
    }
</script>