<template>
    <transition name="toast-fade">
        <div class="toast"
             v-show="visible"
             @mouseenter="clearTimer"
             @mouseleave="startTimer">
            <img class="toast-img" :src="typeImg" alt="">
            <div class="toast-group">
                <p>{{ message }}</p>
                <div class="toast-close-button" @click="close">x</div>
            </div>
        </div>
    </transition>
</template>
<style lang="scss">
    @import "../scss/_var.scss";

    .toast {
        box-shadow: $box-shadow-base;
        min-width: 300px;
        padding: 10px 12px;
        box-sizing: border-box;
        border-radius: 2px;
        position: fixed;
        left: 50%;
        top: 1px;
        transform: translateX(-50%);
        background-color: #ffffff;
        transition: opacity 0.3s, transform .4s;
        overflow: hidden;

        .toast-group {
            margin-left: 38px;
            position: relative;
            height: 20px;
            line-height: 20px;
            display: flex;
            align-items: center;

            & p {
                font-size: 14px;
                margin: 0 34px 0 0;
                white-space: nowrap;
                color: black;
                text-align: justify;
            }
        }
        .toast-img {
            size: 40px;
            position: absolute;
            left: 0;
            top: 0;
        }
        .toast-close-button {
            position: absolute;
            right: 3px;
            cursor: pointer;
            color: silver;
            font-size: 14px;

            &:hover {
                color: grey;
            }
        }
    }

    .toast-fade-enter,
    .toast-fade-leave-active {
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
