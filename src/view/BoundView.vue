<template>
    <section class="bound-section">
        <div class="bound-info">
            <i class="fa fa-check-square fa-3x bound-icon" aria-hidden="true"></i>
            <div>
                <div v-if="shortcut.primary">
                    <span class="shortcut">ALT+SHIFT+{{ shortcut.key }}</span>
                </div>
                <div v-else>
                    <p>The url already bound with <span class="shortcut">ALT+{{ shortcut.key }}</span></p>
                </div>
                <p id="bound_time">{{shortcut.created_time | fromNow}}</p>
            </div>
        </div>

        <button @click="handleShortcutUnbinding(shortcut)" class="delete-button">Delete Shortcut</button>
    </section>
</template>
<style lang="less">
    @import "../less/_var.less";

    .bound-section {
        display: flex;
        margin: 25px;
        flex-direction: column;
        align-items: center;

        .bound-info {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
        }

        .bound-icon {
            color: #09BB07;
            margin: 0 10px;
        }

    }

    .delete-button {
        .button;
        background-color: rgb(181, 61, 10);
        text-align: center;
        padding: 10px;
        color: white;
        border: none;
        border-radius: 3px;
        margin-top: 20px;
        width: 80%;
    }
</style>
<script type="es6">
    import moment from "moment";
    import mixin from "../js/mixin.js";

    export default{
        name: 'bound-view',
        data(){
            return {};
        },
        props: {
            shortcut: {
                type: Object,
                default: function() {
                    return {};
                },
            }
        },
        filters: {
            //Custom filter to use moment.js format time as fromNow type.
            fromNow: function(time) {
                return moment(time).fromNow();
            }
        },
        mixins: [mixin],
    }
</script>