<template>
    <div>
        Or specify two keystroke primary key:
        <br>
        <div class="two-keystroke">
            <input class="keystroke" v-model="strokeKeyChar">
            <input class="comment" v-model="strokeComment">
            <input type="button" value="Bind" @click="emitBindEvent">
        </div>
    </div>
</template>
<style lang="less">
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
    import mixin from "../js/mixin.js";

    export default {
        name: 'compound-bind',
        data() {
            return {
                strokeKeyChar: null,
                strokeComment: null,
            };
        },
        mixins: [mixin],
        methods: {
            emitBindEvent: function() {
                this.$emit('bind-compound-shortcut', this.strokeKeyChar, this.strokeComment);
            }
        }
    }
</script>