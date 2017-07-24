<template>
    <div class="compound-keyboard">
        <div v-for="rowKey in ' ' + alphabet" class="row">
            <div class="key column-header" :class="{'left-corner':rowKey===' '}">{{ rowKey }}</div>
            <div class="key" :class="rowClass(rowKey + columnKey)"
                 v-for="columnKey in alphabet">
                {{rowKey + columnKey }}
            </div>
        </div>
    </div>
</template>
<style lang="css">
    .compound-keyboard {
        max-width: 400px;
        max-height: 225px;
        white-space: nowrap;
        overflow: scroll;
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
    }

    .key:before {
        display: inline-block;
        vertical-align: middle;
        height: 100%;
        content: '';
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
                        'disabled': true
                    } : {
                        'highlight': key === this.highlightKey
                    };
                }
            }
        }
    }
</script>