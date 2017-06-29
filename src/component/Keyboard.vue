<template>
    <div id="container">
        <ul id="keyboard">
            <li v-for="key in keys" :class="liClass(key)">
                <div @mouseover="onKeyHoverChanged($event,true)"
                     @mouseleave="onKeyHoverChanged($event,false)"
                     class="button"
                     :class="buttonClass(key)">
                    {{key}}
                </div>
            </li>
        </ul>
    </div>
</template>
<style lang="css">
    * {
        margin: 0;
        padding: 0;
    }

    #container {
        margin: 0 auto;
        position: relative;
        width: 450px;
    }

    .clear_left {
        clear: left;
    }

    #keyboard .number {
        width: 40px;
    }

    #keyboard .letter_q {
        margin-left: 15px;
    }

    #keyboard .letter_a {
        margin-left: 38px;
    }

    #keyboard .letter_z {
        margin-left: 72px;
    }

    #keyboard li {
        float: left;
        margin: 0 5px 5px 0;
    }

    #keyboard .button {
        width: 35px;
        height: 35px;
        line-height: 35px;
        text-align: center;
        font-size: 15px;
        background: #fff;
        border: 1px solid #f9f9f9;
        -moz-border-radius: 5px;
        -webkit-border-radius: 5px;
    }

    #keyboard .select {
        border: 1px solid #dd4814;
    }

    #keyboard li:hover {
        position: relative;
        top: 1px;
        left: 1px;
        border-color: #e5e5e5;
        cursor: pointer;
    }

    #keyboard .disabled {
        background: #cccccc;
        cursor: text;
    }
</style>
<script type="es6">
    export default{
        name: 'Keyboard',
        data(){
            return {
                selectedKey: null,
                keys: [
                    '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
                    'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
                    'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
                    'Z', 'X', 'C', 'V', 'B', 'N', 'M'
                ]
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
            }
        },
        methods: {
            onKeyClick: function(event) {
                //What difference between e.currentTarget and e.target,
                // refer to http://jsfiddle.net/misteroneill/kmn4A/3/
                this.selectedKey = event.target.innerText;
                this.$emit('key-changed', this.selectedKey);
            },
            onKeyHoverChanged: function(event, flag) {
                if (flag) {
                    this.$emit('key-hover-over', event.target);
                } else {
                    this.$emit('key-hover-leave', event.target);
                }
            },
            //Return a li element class literal object.
            liClass: function(key) {
                let liClass = {};
                liClass.clear_left = ['Q', 'A', 'Z'].indexOf(key) !== -1;
                liClass.letter_q = key === 'Q';
                liClass.letter_a = key === 'A';
                liClass.letter_z = key === 'Z';

                if (key in ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']) {
                    liClass.number = true;
                } else {
                    liClass.letter = true;
                }

                liClass.select = key === this.selectedKey;
                return liClass;
            },
            buttonClass: function(key) {
                return {
                    disabled: this.checkDisable(key)
                }
            },
            checkDisable: function(key) {
                return this.boundKeys && this.boundKeys.indexOf(key) !== -1;
            }
        }
    }
</script>