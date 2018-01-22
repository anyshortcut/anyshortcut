<template>
    <div class="compound-keyboard">
        <div :style="{top:-scrollTop+'px'}" class="left-column">
            <span class="column-header" v-for="rowKey in alphabet">
                    {{ rowKey }}
            </span>
        </div>

        <table>
            <thead :style="{left:-scrollLeft+'px'}">
            <tr>
                <th v-for="rowKey in alphabet"
                    class='row-header'>
                    {{ rowKey }}
                </th>
            </tr>
            </thead>
            <tbody ref="tbody" @scroll="onScroll" id="compound-tbody">
            <tr v-for="rowKey in alphabet">
                <td :id="rowKey + columnKey"
                    :class="rowClass(rowKey + columnKey)"
                    v-for="columnKey in alphabet">
                    {{rowKey + columnKey }}
                </td>
            </tr>
            </tbody>
        </table>
        <div class="table-action"></div>
    </div>
</template>
<style lang="less">
    @max-width: 410px;

    .compound-keyboard {
        position: relative;
        display: flex;
        margin: auto;
        overflow: hidden;
        height: 280px;

        .table-action {
            position: absolute;
            left: 0;
            top: 0;
            width: 30px;
            height: 36px;
            background-color: white;
            z-index: 2;
        }
    }

    .left-column {
        margin-top: 36px;
        height: 250px;
        position: relative;
        overflow: visible;
    }

    table {
        position: relative;
        overflow: hidden;
        border-collapse: separate;
        border-spacing: 10px;
        margin: 0 auto;
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

    thead th {
        min-width: 35px;
        height: 24px;
    }

    tbody {
        position: relative;
        display: block;
        max-width: @max-width;
        height: 250px;
        overflow: scroll;
    }

    td {
        position: relative;
        color: #565656;
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
        min-height: 35px;
        line-height: 35px;
        margin: 10px 0;
        display: block;
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
                scrollTop: 0,
                firstFilterKey: null,
                secondFilterKey: null,
                filterTimes: 0,
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
                        'highlight': key === this.highlightKey ||
                        (!this.highlightKey && key === this.firstFilterKey + this.secondFilterKey),
                    };
                }
            },
            onScroll: function($event) {
                this.scrollLeft = $event.target.scrollLeft;
                this.scrollTop = $event.target.scrollTop;
                this.scrolling = true;
                this.$emit('on-table-scroll');

                if (this._scrollTimeoutId) {
                    window.clearTimeout(this._scrollTimeoutId);
                }

                this._scrollTimeoutId = window.setTimeout(() => {
                    this.scrolling = false;
                }, 200);
            },
            onFilterKeyUp: function(event) {
                // Ignore activeElement input event
                if (document.activeElement.isContentEditable
                    || ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
                    return;
                }

                let keyCode = String.fromCharCode(event.keyCode);
                if (this.alphabet.includes(keyCode)) {
                    if (this.filterTimes % 2 === 0) {
                        this.firstFilterKey = keyCode;
                    } else {
                        this.secondFilterKey = keyCode;
                    }

                    let target = document.getElementById((this.firstFilterKey || 'A') + (this.secondFilterKey || 'A'));
                    target.scrollIntoView({behavior: 'smooth'});

                    if (this._navigateTimeoutId) {
                        window.clearTimeout(this._navigateTimeoutId);
                    }

                    this._navigateTimeoutId = setTimeout(() => {
                        this.$emit('key-hover-over', target);
                    }, 800);

                    this.filterTimes += 1;
                }
            },
        },
        mounted: function() {
            // Query key elements exclude weak element, then add mouse event listener.
            document.getElementById('compound-tbody').querySelectorAll('.raw-key').forEach(element => {
                element.addEventListener('mouseover', () => {
                    if (this.scrolling) return;

                    this.$emit('key-hover-over', element);
                });
                element.addEventListener('mouseleave', () => {
                    this.$emit('key-hover-leave', element);
                });
            });

            document.addEventListener('keyup', this.onFilterKeyUp);
        },
        destroyed() {
            document.removeEventListener('keyup', this.onFilterKeyUp);
        },
    }
</script>