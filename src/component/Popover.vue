<template>
    <transition name="fade">
        <div class="popper"
             v-show="showing"
             @mouseover="show"
             @mouseleave="hidden">
            <slot>Popover</slot>
            <img v-if="showArrow" class="popper-arrow" src="../img/triangle.svg" x-arrow/>
        </div>
    </transition>
</template>
<style lang="scss">
    @import "../scss/_common.scss";

    .popper {
        z-index: 999;
    }

    .popper-arrow {
        position: absolute;
        display: block;
        bottom: -12px;
        margin-top: 0;
        margin-bottom: 0;
        z-index: 1000;
    }

    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s ease-in-out;
    }

    .fade-enter, .fade-leave-to {
        opacity: 0;
    }

</style>
<script type="es6">
    import Popper from "popper";

    export default {
        name: 'Popover',
        data() {
            return {
                showing: false,
            };
        },
        props: {
            refId: {
                type: String,
            },
            showArrow: {
                type: Boolean,
                default() {
                    return true;
                }
            }
        },
        watch: {
            showing: function(newValue) {
                this.$emit('on-show-change', newValue);
            }
        },
        methods: {
            dismiss: function() {
                // Dismiss popover immediately
                this.showing = false;
            },
            hidden: function() {
                // Dismiss popover with delay
                this._timeoutId = setTimeout(() => {
                    this.showing = false;
                }, 200);
            },
            show: function() {
                this.showing = true;
                clearTimeout(this._timeoutId);
            },
            render: function(target) {
                this.show();

                new Popper(target, this.$el, {
                    placement: "top",
                    modifiers: {
                        preventOverflow: {
                            // The default boundaries element is 'scrollParent', we should change to 'window'.
                            boundariesElement: 'window',
                        }
                    }
                });
            },
        },
        mounted() {
            let refElement = this.refId ? document.getElementById(this.refId) : null;
            if (refElement) {
                refElement.onmouseover = () => {
                    this.render(refElement);
                };

                refElement.onmouseleave = () => {
                    this.hidden();
                };
            }
        }
    }
</script>