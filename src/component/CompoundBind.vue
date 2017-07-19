<template>
    <div class="compound-shortcut">
        <div class="primary-text">Specify primary compound key:</div>
        <div class="compound-shortcut-form">
            <input class="compound-key" maxlength="2" minlength="2"
                   v-model="compoundKey"
                   @focus="onCompoundKeyFocus">
            <input id="comment"
                   class="shortcut-comment-input"
                   v-model="comment"
                   placeholder="Comment for this url"
                   maxlength="50"
                   required/>
        </div>
        <div class="shortcut-bind-button" @click="emitBindEvent">Bind</div>
    </div>
</template>
<style lang="less">
    .compound-shortcut {
        display: flex;
        flex-direction: column;
        align-items: center;

        padding: 0 0 15px 0;
    }

    .compound-shortcut-form {
        display: flex;
        align-items: center;

        .compound-key {
            width: 50px;
            height: 25px;
            margin: 10px;
            text-transform: uppercase;
            font-size: 18px;
            text-align: center;
            font-weight: 500;
            letter-spacing: 1.5px;;
        }

    }
</style>
<script type="es6">
    import mixin from "../js/mixin.js";

    export default {
        name: 'compound-bind',
        data() {
            return {
                compoundKey: null,
                comment: null,
            };
        },
        mixins: [mixin],
        methods: {
            emitBindEvent: function() {
                this.$emit('bind-compound-shortcut', this.compoundKey, this.comment);
            },
            onCompoundKeyFocus: function() {
                this.comment = this.comment || this.$background.activeTab.title;
            }
        }
    }
</script>