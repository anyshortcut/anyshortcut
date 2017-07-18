<template>
    <transition name="message-fade">
        <div class="message"
             v-show="visible"
             @mouseenter="clearTimer"
             @mouseleave="startTimer">
            <img class="message__img" :src="typeImg" alt="">
            <div class="message__group">
                <p>{{ message }}</p>
                <div class="message__closeBtn" @click="close">x</div>
            </div>
        </div>
    </transition>
</template>
<style lang="less">
    @import "../less/_var.less";

    .message {
        box-shadow: @message-shadow;
        min-width: @message-min-width;
        padding: @message-padding;
        box-sizing: border-box;
        border-radius: 2px;
        position: fixed;
        left: 50%;
        top: 20px;
        transform: translateX(-50%);
        background-color: #ffffff;
        transition: opacity 0.3s, transform .4s;
        overflow: hidden;

        .message__group {
            margin-left: 38px;
            position: relative;
            height: 20px;
            line-height: 20px;
            display: flex;
            align-items: center;

            & p {
                font-size: @font-size-base;
                margin: 0 34px 0 0;
                white-space: nowrap;
                color: @message-content-color;
                text-align: justify;
            }
        }
        .message__img {
            size: 40px;
            position: absolute;
            left: 0;
            top: 0;
        }
        .message__closeBtn {
            position: absolute;
            right: 3px;
            cursor: pointer;
            color: @message-close-color;
            font-size: @font-size-base;

            &:hover {
                color: @message-close-hover-color;
            }
        }
    }

    .message-fade-enter,
    .message-fade-leave-active {
        opacity: 0;
        transform: translate(-50%, -100%);
    }

</style>
<script type="es6">
    export default {
        data() {
            return {
                visible: false,
                message: '',
                type: 'info',
                duration: 2000,
                timer: null,
                closed: false,
            }
        },
        computed: {
            typeImg() {
                return require(`../img/${ this.type }.svg`);
            }
        },
        watch: {
            closed(newVal) {
                if (newVal) {
                    this.visible = false;
                    this.$el.addEventListener('transitionend', this.destroyElement);
                }
            }
        },
        methods: {
            close() {
                this.closed = true;
                if (typeof this.onClose === 'function') {
                    this.onClose(this);
                }
            },
            destroyElement() {
                this.$el.removeEventListener('transitionend', this.destroyElement);
                this.$destroy(true);
                this.$el.parentNode.removeChild(this.$el);
            },
            clearTimer() {
                clearTimeout(this.timer);
            },
            startTimer() {
                if (this.duration > 0) {
                    this.timer = setTimeout(() => {
                        if (!this.closed) {
                            this.close();
                        }
                    }, this.duration);
                }
            }
        },
        mounted() {
            this.startTimer();
        }
    };
</script>
