<template>
    <div id="container">
        <pre>{{obj}}</pre>
        <ul id="keyboard">
            <li v-for="key in keys" @click="onKeyClick($event)" :class="liClass(key)">{{key}}</li>
        </ul>
    </div>
</template>
<style>
    * {
        margin: 0;
        padding: 0;
    }

    body {
        font: 71%/1.5 Verdana, Sans-Serif;
        background: #eee;
    }

    #container {
        margin: 100px auto;
        width: auto;
    }

    #keyboard {
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .clear_left {
        clear: left;
    }

    #keyboard .number {
        width: 42px;
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
        width: 40px;
        height: 40px;
        line-height: 40px;
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
</style>
<script>
    export default{
        name: 'Keyboard',
        data(){
            return {
                keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
                    'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
                    'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
                    'Z', 'X', 'C', 'V', 'B', 'N', 'M'],
                obj: ''
            }
        },
        props: {
            keys: {
                type: Array
            }
        },
        methods: {
            onKeyClick: function(event) {
                //What difference between e.currentTarget and e.target,
                // refer to http://jsfiddle.net/misteroneill/kmn4A/3/
                this.obj = event.target.innerText;
            },
            // li element class
            liClass: function(letter) {
                let liClass = {};
                liClass.clear_left = ['Q', 'A', 'Z'].indexOf(letter) !== -1;
                liClass.letter_q = letter === 'Q';
                liClass.letter_a = letter === 'A';
                liClass.letter_z = letter === 'Z';

                if (letter in ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']) {
                    liClass.number = true;
                } else {
                    liClass.letter = true;
                }
                return liClass;
            }
        }
    }
</script>