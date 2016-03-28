<template>
    <div id="container">
        <ul id="keyboard">
            <li class="symbol">1</li>
            <li class="symbol">2</li>
            <li class="symbol">3</li>
            <li class="symbol">4</li>
            <li class="symbol">5</li>
            <li class="symbol">6</li>
            <li class="symbol">7</li>
            <li class="symbol">8</li>
            <li class="symbol">9</li>
            <li class="symbol">0</li>
            <li class="letter clear-left" id="q">Q</li>
            <li class="letter">W</li>
            <li class="letter">E</li>
            <li class="letter">R</li>
            <li class="letter">T</li>
            <li class="letter">Y</li>
            <li class="letter">U</li>
            <li class="letter">I</li>
            <li class="letter">O</li>
            <li class="letter">P</li>
            <li class="letter clear-left" id="a">A</li>
            <li class="letter">S</li>
            <li class="letter">D</li>
            <li class="letter">F</li>
            <li class="letter">G</li>
            <li class="letter">H</li>
            <li class="letter">J</li>
            <li class="letter">K</li>
            <li class="letter">L</li>
            <li class="letter clear-left" id="z">Z</li>
            <li class="letter">X</li>
            <li class="letter">C</li>
            <li class="letter">V</li>
            <li class="letter">B</li>
            <li class="letter">N</li>
            <li class="letter">M</li>
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

    .clear-left {
        clear: left;
    }

    #keyboard #q {
        margin-left: 5px;
    }

    #keyboard #a {
        margin-left: 35px;
    }

    #keyboard #z {
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
                msg: 'hello vue'
            }
        }
    }
</script>