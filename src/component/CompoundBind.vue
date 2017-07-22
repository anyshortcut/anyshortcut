<template>
    <div class="compound-shortcut">
        <div class="primary-text">Specify primary compound key:</div>
        <div class="compound-shortcut-form">
            <input id="compound-key" class="compound-key" maxlength="2" minlength="2"
                   v-model="compoundKey"
                   @focus="onCompoundKeyFocus"
                   @blur="onCompoundKeyBlur">
            <input id="comment"
                   class="shortcut-comment-input"
                   v-model="comment"
                   placeholder="Comment for this url"
                   maxlength="50"
                   required/>
        </div>
        <div class="shortcut-bind-button" @click="emitBindEvent">Bind</div>

        <div id="compound-popover"
             class="popper"
             v-show="showPopper">
            <div v-if="keyStatus=='empty'">Specify two letter key.</div>
            <div v-else-if="keyStatus=='available'">{{ compoundKey }} is available</div>
            <div v-else-if="keyStatus=='occupied'">{{ compoundKey }} is occupied.</div>
            <div class="popper-arrow" x-arrow></div>
        </div>
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
    import Popper from "popper";

    export default {
        name: 'compound-bind',
        data() {
            return {
                compoundKey: null,
                comment: null,
                showPopper: false,
                keyStatus: 'empty',
            };
        },
        watch: {
            compoundKey: function() {
                this.handlePopper();
            }
        },
        methods: {
            emitBindEvent: function() {
                this.$bus.emit('bind-shortcut', this.compoundKey, this.comment);
            },
            onCompoundKeyFocus: function() {
                this.comment = this.comment || this.$background.activeTab.title;

                this.showPopper = true;
                new Popper(document.querySelector("#compound-key"),
                    document.querySelector("#compound-popover"), {
                        placement: "top"
                    });
            },
            onCompoundKeyBlur: function() {
                this.showPopper = false;
            },
            handlePopper: function() {
                if (this.compoundKey.length === 2) {
                    let shortcut = this.$background.getPrimaryShortcut(this.compoundKey.toUpperCase());
                    if (shortcut) {
                        this.keyStatus = 'occupied';
                    } else {
                        this.keyStatus = 'available';
                    }
                } else {
                    this.keyStatus = 'empty';
                }
            }
        },
    }
</script>