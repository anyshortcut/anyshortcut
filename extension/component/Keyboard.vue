<template>
    <div id="container">
        <ul id="keyboard">
            <li v-for="key in keys" :class="liClass(key)">
                <button @click="onKeyClick($event)" v-disabled="checkDisable(key)" class="button">
                    {{key}}
                </button>
            </li>
        </ul>
    </div>
</template>
<style lang="css">
    * {
        margin: 0;
        padding: 0;
    }

    /*#container {*/
    /*position: absolute;*/
    /*z-index: 1000;*/
    /*left: 0;*/
    /*top: 0;*/
    /*width: 100%;*/
    /*height: 100%;*/
    /*}*/

    #keyboard {
        margin: 0;
        /*padding: 180px 0 0;*/
        list-style: none;
        background-color: #ffffff;
    }

    .clear_left {
        clear: left;
    }

    #keyboard .number {
        width: 32px;
    }

    #keyboard .letter_q {
        margin-left: 10px;
    }

    #keyboard .letter_a {
        margin-left: 35px;
    }

    #keyboard .letter_z {
        margin-left: 70px;
    }

    #keyboard li {
        float: left;
        margin: 0 5px 5px 0;
    }

    #keyboard button {
        width: 30px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        background: #fff;
        border: 1px solid #f9f9f9;
        -moz-border-radius: 5px;
        -webkit-border-radius: 5px;
    }

    #keyboard li:hover {
        position: relative;
        top: 1px;
        left: 1px;
        border-color: #e5e5e5;
        cursor: pointer;
    }

    #keyboard button:disabled {
        background: #cccccc;
    }
</style>
<script type="es6">
    export default{
        name: 'Keyboard',
        data(){
            return {
                keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
                    'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
                    'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
                    'Z', 'X', 'C', 'V', 'B', 'N', 'M']
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
        directives: {
            //A custom nested directive that can check the target element disabled property according to
            // already bound key array.
            disabled: {
                update: function(el, binding) {
                    el.disabled = binding.value;
                }
            }
        },
        methods: {
            onKeyClick: function(event) {
                //What difference between e.currentTarget and e.target,
                // refer to http://jsfiddle.net/misteroneill/kmn4A/3/
                let key = event.target.innerText;
                this.$emit('key-click', key);
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
                return liClass;
            },
            checkDisable: function(key) {
                return this.boundKeys && this.boundKeys.indexOf(key) !== -1;
            }
        }
    }
</script>