<template>
    <table class="compound-keyboard" id="compound-keyboard">
        <thead :style="{left:-scrollLeft+'px'}">
        <tr>
            <th></th>
            <th v-for="rowKey in alphabet"
                class='row-header'>
                {{ rowKey }}
            </th>
        </tr>
        </thead>
        <tbody @scroll="onScroll">
        <tr v-for="rowKey in alphabet">
            <td class="column-header"
                :style="columnHeaderStyle">
                {{ rowKey }}
            </td>
            <td clas="key" :class="rowClass(rowKey + columnKey)"
                v-for="columnKey in alphabet">
                {{rowKey + columnKey }}
            </td>
        </tr>
        </tbody>
        <div class="table-action"></div>
    </table>
</template>
<style lang="less">
    @max-width: 400px;

    table {
        position: relative;
        overflow: hidden;
        border-collapse: separate;
        border-spacing: 10px;
        margin: 0 auto;
    }

    .table-action {
        position: absolute;
        left: 0;
        top: 10px;
        width: 35px;
        height: 30px;
        background-color: white;
        z-index: 2;
    }

    thead {
        position: relative;
        display: block;
        max-width: @max-width;
        overflow: visible;
        border-spacing: 10px 0;
        padding: 2px 0;
    }

    th {
        font-weight: 400;
        padding: 0;
        margin: 0;
    }

    thead th:not(:first-child) {
        min-width: 35px;
        height: 24px;
    }

    thead th:nth-child(1) {
        display: block;
        width: 24px;
    }

    tbody {
        position: relative;
        display: block;
        max-width: @max-width;
        height: 240px;
        overflow: scroll;
    }

    tbody tr td:nth-child(1) {
        position: relative;
        min-width: 24px;
        cursor: text;
    }

    td {
        position: relative;
        min-width: 35px;
        height: 35px;
        line-height: 35px;
        text-align: center;
        vertical-align: center;
        background: white;
        border: solid 1px #ededed;
        border-radius: 2px;
        cursor: pointer;
        font-size: 14px;
        padding: 0;
        margin: 0;
    }

    .column-header, .row-header {
        border: 1px solid #E9EDFB;
        color: #4F6EC8;
        z-index: 1;
    }

    .row-header {
        height: 20px;
        line-height: 20px;
    }

    .column-header {
        width: 20px;
    }

    .highlight {
        background: #E9EDFB;
        color: #4F6EC8;
        font-weight: 500;
        box-shadow: none;
    }

    .disabled {
        background: #ececec;
        cursor: text;
    }

</style>
<script type="es6">
    export default {
        name: 'CompoundKeyboard',
        data() {
            return {
                alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                numbers: '0123456789',
                scrolling: false,
                scrollLeft: 0,
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
        computed: {
            columnHeaderStyle: function() {
                if (this.scrollLeft <= 10) return;

                return {
                    left: this.scrollLeft - 10 + 'px',
                };
            }
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
            onScroll: function($event) {
                this.scrollLeft = $event.target.scrollLeft;
                this.scrolling = true;
                this.$emit('on-table-scroll');

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