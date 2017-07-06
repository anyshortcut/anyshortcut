<template>
    <div class="container">
        <div class="keyboard">
            <div class="keyboard-row">
                <div class="key weak"></div>
                <div class="key number">1</div>
                <div class="key number">2</div>
                <div class="key number">3</div>
                <div class="key number">4</div>
                <div class="key number">5</div>
                <div class="key number">6</div>
                <div class="key number">7</div>
                <div class="key number">8</div>
                <div class="key number">9</div>
                <div class="key number">0</div>
                <div class="key weak"></div>
            </div>
            <div class="keyboard-row">
                <div class="key weak"></div>
                <div class="key">Q</div>
                <div class="key">W</div>
                <div class="key">E</div>
                <div class="key">R</div>
                <div class="key">T</div>
                <div class="key">Y</div>
                <div class="key">U</div>
                <div class="key">I</div>
                <div class="key">O</div>
                <div class="key">P</div>
                <div class="key weak"></div>
            </div>
            <div class="keyboard-row">
                <div class="key weak extra-size-two"></div>
                <div class="key">A</div>
                <div class="key">S</div>
                <div class="key">D</div>
                <div class="key">F</div>
                <div class="key highlight">G</div>
                <div class="key">H</div>
                <div class="key">J</div>
                <div class="key">K</div>
                <div class="key">L</div>
                <div class="key weak extra-size-two"></div>
            </div>
            <div class="keyboard-row">
                <div class="key weak highlight double-size lowercase lower-left">shift</div>
                <div class="key">Z</div>
                <div class="key">X</div>
                <div class="key">C</div>
                <div class="key">V</div>
                <div class="key">B</div>
                <div class="key">N</div>
                <div class="key disabled">M</div>
                <div class="key weak double-size lowercase lower-right">shift</div>
            </div>
            <div class="keyboard-row">
                <div class="key weak lower-left lowercase">ctrl</div>
                <div class="key weak lower-center lowercase highlight">alt</div>
                <div class="key weak lower-center lowercase extra-size-two">&#8984;</div>
                <div class="key weak space-bar"></div>
                <div class="key weak lower-center lowercase extra-size-two">&#8984;</div>
                <div class="key weak lower-center lowercase">alt</div>
                <div class="key weak lower-right lowercase">ctrl</div>
            </div>
        </div>
    </div>
</template>
<style lang="less">
    * {
        box-sizing: border-box;
    }

    .container {
        max-width: 500px;
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
            border-color: #e5e5e5;
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
            box-shadow: inset 0 -2px 0 #aaaaaa,
            inset 0px 1px 1px -1px #fff,
            0px 1px 1px 0px #7a7a7a;
        }

        &.highlight {
            border-color: #dd4814;
            color: #dd4814;
            border-width: 1.2px;
            box-shadow: inset 0 -2px 0 #dd4814,
            inset 0px 1px 1px -1px #fff,
            0px 1px 1px 0px #dd4814;
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
            return {
                selectedKey: null,
            }
        },
        props: {
            boundKeys: {
                type: Array,
                default: function() {
                    return [];
                }
            }
        },
        watch: {
            boundKeys: function() {
                // Restore selectedKey to null where boundKeys changed.
                this.selectedKey = null;
                // Emit a key-changed event to notify that the selectedKey changed.
                this.$emit('key-changed', this.selectedKey);

                document.querySelectorAll('.key').forEach(element => {
                    this.resolveDisableProperty(element);
                });
            }
        },
        methods: {
            onKeyClick: function(event) {
                //What difference between e.currentTarget and e.target,
                // refer to http://jsfiddle.net/misteroneill/kmn4A/3/
                this.selectedKey = event.target.innerText;
                this.$emit('key-changed', this.selectedKey);
            },
            resolveDisableProperty: function(element) {
                if (this.boundKeys && this.boundKeys.indexOf(element.innerText) !== -1) {
                    element.className += ' disabled';
                } else {
                    element.className = element.className.replace('disabled', '');
                }
            },
            toggleWeakElementVisibility: function(visible) {
                document.querySelectorAll('.weak').forEach(element => {
                    element.style.visibility = visible ? 'visible' : 'hidden';
                });
            }
        },
        mounted: function() {
            document.querySelectorAll('.key').forEach(element => {
                element.addEventListener('mouseover', () => {
                    this.$emit('key-hover-over', element);
                    this.toggleWeakElementVisibility(true);
                });
                element.addEventListener('mouseleave', () => {
                    this.$emit('key-hover-leave', element);
                    this.toggleWeakElementVisibility(false);
                });

                this.resolveDisableProperty(element);
            });
        },
    }
</script>