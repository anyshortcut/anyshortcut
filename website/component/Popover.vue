<template>
    <div class="popper"
         v-show="showing">
        <slot>Popover</slot>
        <img class="popper-arrow" x-arrow/>
    </div>
</template>
<style lang="scss">

    .popper {
        position: absolute;
        background: #FFFFFF;
        border-radius: 3px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
        padding: 10px;
        z-index: 999;
    }

    .popper .popper-arrow {
        width: 0;
        height: 0;
        border-style: solid;
        position: absolute;
        margin: 5px;
        border-color: #FFFFFF;
    }

    .popper[x-placement^="top"] {
        margin-bottom: 5px;
    }

    .popper[x-placement^="top"] .popper-arrow {
        border-width: 5px 5px 0 5px;
        border-left-color: transparent;
        border-right-color: transparent;
        border-bottom-color: transparent;
        bottom: -5px;
        left: calc(50% - 5px);
        margin-top: 0;
        margin-bottom: 0;
    }

    .popper[x-placement^="bottom"] {
        margin-top: 5px;
    }

    .popper[x-placement^="bottom"] .popper-arrow {
        border-width: 0 5px 5px 5px;
        border-left-color: transparent;
        border-right-color: transparent;
        border-top-color: transparent;
        top: -5px;
        left: calc(50% - 5px);
        margin-top: 0;
        margin-bottom: 0;
    }

    .popper[x-placement^="right"] {
        margin-left: 5px;
    }

    .popper[x-placement^="right"] .popper-arrow {
        border-width: 5px 5px 5px 0;
        border-left-color: transparent;
        border-top-color: transparent;
        border-bottom-color: transparent;
        left: -5px;
        top: calc(50% - 5px);
        margin-left: 0;
        margin-right: 0;
    }

    .popper[x-placement^="left"] {
        margin-right: 5px;
    }

    .popper[x-placement^="left"] .popper-arrow {
        border-width: 5px 0 5px 5px;
        border-top-color: transparent;
        border-right-color: transparent;
        border-bottom-color: transparent;
        right: -5px;
        top: calc(50% - 5px);
        margin-left: 0;
        margin-right: 0;
    }
</style>
<script type="es6">
    import Popper from "popper.js";

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
            placement: {
                type: String,
                default() {
                    return 'top';
                }
            },
            trigger: {
                type: String,
                default() {
                    return 'hover';
                }
            }
        },
        watch: {
            showing: function (newValue) {
                this.$emit('on-show-change', newValue);
            }
        },
        methods: {
            dismiss: function () {
                // Dismiss popover immediately
                this.showing = false;
            },
            hidden: function () {
                // Dismiss popover with delay
                this._timeoutId = setTimeout(() => {
                    this.showing = false;
                }, 200);
            },
            show: function () {
                this.showing = true;
                clearTimeout(this._timeoutId);
            },
            render: function (target) {
                this.show();

                new Popper(target, this.$el, {
                    placement: "top"
                });
            },
        },
        mounted() {
            let refElement = this.refId ? document.getElementById(this.refId) : null;
            if (refElement) {
                if (this.trigger === 'hover') {
                    this.$el.onmouseover = refElement.onmouseover = () => {
                        this.render(refElement);
                    };

                    this.$el.onmouseleave = refElement.onmouseleave = () => {
                        this.hidden();
                    };
                } else if (this.trigger === 'click') {
                    refElement.onclick = () => {
                        if (this.showing) {
                            this.hidden();
                        } else {
                            this.render(refElement);
                        }
                    };
                }
            }
        }
    }
</script>