<template>
    <div class="compound-keyboard" id="compound-keyboard"
         @scroll="onScroll">
        <div v-for="rowKey in ' ' + alphabet" class="row">
            <div class="key column-header" :class="{'left-corner':rowKey===' '}">{{ rowKey }}</div>
            <div class="key" :class="rowClass(rowKey + columnKey)"
                 v-for="columnKey in alphabet">
                {{ rowKey + columnKey }}
            </div>
        </div>
    </div>
</template>
<style lang="less">
    .compound-keyboard {
        max-height: 225px;
        white-space: nowrap;
        overflow: scroll;
        margin: 10px 32px 20px;
    }

    .key {
        position: relative;
        display: inline-block;
        width: 35px;
        height: 35px;
        line-height: 35px;
        text-align: center;
        vertical-align: center;
        background: white;
        border: solid 1px #ededed;
        border-radius: 2px;
        margin: 5px;
        cursor: pointer;

        &.disabled {
            background: #ececec;
            cursor: text;
        }
    }

    .key:before {
        display: inline-block;
        vertical-align: middle;
        height: 100%;
        /*content: '';*/
    }

    .left-corner {
        width: 20px;
        height: 20px;
    }

    .column-header, .row-header {
        border: 1px solid #E9EDFB;
        color: #4F6EC8;
    }

    .row-header {
        height: 20px;
        line-height: 20px;
    }

    .column-header {
        width: 20px;
    }

</style>
<script type="es6">
    export default {
        name: 'CompoundGrid',
        data() {
            return {
                alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                numbers: '0123456789',
                scrolling: false,
            };
        },
        props: {
            boundKeys: {
                type: Array,
                default: function() {
                    return [];
                }
            },
            highlightKey: {
                type: String,
                default: function() {
                    return null;
                }
            },
        },
        methods: {
            rowClass: function(key) {
                if (key.trim().length === 1) {
                    return {
                        'row-header': true,
                    }
                } else {
                    return this.boundKeys.indexOf(key) !== -1 ? {
                        'raw-key': true,
                        'disabled': true,
                    } : {
                        'raw-key': true,
                        'highlight': key === this.highlightKey,
                    };
                }
            },
            onScroll: function() {
                this.scrolling = true;
                if (this._scrollTimeoutId) {
                    window.clearTimeout(this._scrollTimeoutId);
                }

                this._scrollTimeoutId = window.setTimeout(() => {
                    this.scrolling = false;
                }, 200);
            },
        },
        mounted: function() {
            // Query key elements exclude weak element, then add mouse event listener.
            document.getElementById('compound-keyboard').querySelectorAll('.raw-key').forEach(element => {
                element.addEventListener('mouseover', () => {
                    if (this.scrolling) return;

                    this.$emit('key-hover-over', element);
                });
                element.addEventListener('mouseleave', () => {
                    this.$emit('key-hover-leave', element);
                });
            });
        },
    }
</script>