<template>
    <div class="popper"
         v-show="showing"
         @mouseover="show"
         @mouseleave="hidden">
        <slot>Popover</slot>
        <img class="popper-arrow" x-arrow/>
    </div>
</template>
<style lang="less">
    @import "../less/_common.less";

    .popper {
        border-radius: 3px;
        background-color: #ffffff;
        box-shadow: @box-shadow-base;
        padding: 5px;
        margin-bottom: 5px;
        z-index: 999;
    }

    .popper-arrow {
        content: url('../img/triangle.svg');
        position: absolute;
        display: block;
        bottom: -12px;
        left: calc(50% - 5px);
        margin-top: 0;
        margin-bottom: 0;
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
                    placement: "top"
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