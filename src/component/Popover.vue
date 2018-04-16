<template>
    <transition :name="transitionName">
        <div class="popper"
             v-show="showing"
             @mouseenter="show"
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

    .tooltip {
        background: fade_out(#fefefe, 0.1);
        font-size: 12px;
        color: $primary-color;
        padding: 5px;
        border-radius: 3px;
        box-shadow: 0 0 20px 4px rgba(154, 161, 177, 0.15), 0 4px 80px -8px rgba(36, 40, 47, 0.25), 0 4px 4px -2px rgba(91, 94, 105, 0.15);
    }

    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s ease-in;
    }

    .fade-enter, .fade-leave-to {
        opacity: 0;
    }

</style>
<script type="es6">
    import Popper from "popper";
    import _ from "lodash";

    export default {
        name: 'Popover',
        data() {
            return {
                popper: null,
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
            },
            transitionName: {
                type: String,
                default() {
                    return 'fade';
                }
            },
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
                if (!this.popper) {
                    let emptyReference = {};
                    this.popper = new Popper(emptyReference, this.$el, {
                        placement: "top",
                        modifiers: {
                            preventOverflow: {
                                // The default boundaries element is 'scrollParent', we should change to 'window'.
                                boundariesElement: 'window',
                            }
                        }
                    });
                }

                this.popper.reference = target;
                // Don't use scheduleUpdate() method because of has bad UI shake in Firefox
                // this.popper.scheduleUpdate();
                this.popper.update();
            },
        },
        mounted() {
            let refElement = this.refId ? document.getElementById(this.refId) : null;
            if (refElement) {
                refElement.onmouseenter = _.throttle(() => {
                    this.render(refElement);
                }, 200);

                refElement.onmouseleave = _.throttle(() => {
                    this.hidden();
                }, 200);
            }
        }
    }
</script>