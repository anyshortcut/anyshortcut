<template>
    <section class="bound-section">
        <img src="../img/check.svg" alt="" class="bound-icon">
        <div class="bound-info">
            <div class="bound-shortcut">
                <p v-if="shortcut.primary" class="primary-text">Primary shortcut:
                    <span class="shortcut">ALT+SHIFT+{{ shortcut.key }}</span>
                </p>
                <p v-else class="primary-text">Secondary shortcut:
                    <span class="shortcut">ALT+{{ shortcut.key }}</span>
                </p>
                <img class="delete-button"
                     @click="handleShortcutUnbinding(shortcut)"
                     src="../img/delete.svg" alt="Delete"/>
            </div>
            <p class="bound-stats">
                You have open the shortcut <span class="shortcut-property">{{shortcut.open_times}}</span>
                times since <span class="shortcut-property">{{shortcut.created_time | fromNow}}</span>
            </p>
        </div>
    </section>
</template>
<style lang="less">
    @import "../less/_var.less";

    .bound-section {
        display: flex;
        margin: 25px;

        flex-direction: row;
        justify-content: center;
        align-items: center;

        .bound-icon {
            background-color: #67D500;
            width: 70px;
            height: 70px;
            margin: 0 10px;
            border-radius: 50%;
            padding: 5px;
        }

        .bound-info {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .bound-shortcut {
            display: flex;
            align-items: center;
        }

        .bound-stats {
            padding: 10px;
            text-align: center;
            width: 320px;
            color: #666666;
            font-size: 15px;
        }

        .shortcut-property {
            font-weight: 500;
            color: #333333;
        }
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