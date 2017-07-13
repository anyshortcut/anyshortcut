<template>
    <div>
        <section class="bound-section">
            <img src="../img/check.svg" alt="" class="bound-icon">
            <div class="bound-info">
                <p v-if="shortcut.primary" class="primary-text">Primary shortcut:
                    <span class="shortcut">ALT+SHIFT+{{ shortcut.key }}</span>
                    <span>
                            <img class="delete-button"
                                 @click="showDeleteModal=true"
                                 src="../img/delete-light.svg" alt="Delete"/>
                    </span>
                </p>
                <p v-else class="primary-text">Secondary shortcut:
                    <span class="shortcut">ALT+{{ shortcut.key }}</span>
                    <span>
                            <img class="delete-button"
                                 @click="handleShortcutUnbinding(shortcut)"
                                 src="../img/delete-light.svg" alt="Delete"/>
                    </span>
                </p>
                <p class="bound-stats">
                    You have open the shortcut <span class="shortcut-property">{{shortcut.open_times}}</span>
                    times since <span class="shortcut-property">{{shortcut.created_time | fromNow}}</span>
                </p>
            </div>
        </section>

        <div class="shortcut-delete-modal" v-show="showDeleteModal">
            <i class="close" @click="showDeleteModal=false">X</i>
            <p> Feel free to delete the primary shortcut, all secondary shortcuts of the domain still remain.</p>
            <div class="shortcut-delete-button"
                 @click="handleShortcutUnbinding(shortcut);showDeleteModal=false;">
                Sure, delete it!
            </div>
        </div>
    </div>
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

        .bound-stats {
            padding: 10px;
            margin-top: 5px;
            text-align: center;
            width: 320px;
            color: #666666;
            font-size: 15px;
        }

        .shortcut-property {
            font-weight: 500;
            color: #333333;
        }

        .delete-button {
            vertical-align: middle;
        }
    }

    .shortcut-delete-modal {
        margin: auto;
        position: absolute;
        width: 60%;
        height: 180px;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;

        display: flex;
        flex-direction: column;
        align-items: center;
        border-radius: 3px;
        background-color: #ffffff;
        box-shadow: @box-shadow-base;
        font-size: 15px;

        p {
            margin: 0 25px 20px 25px;
            color: #2b72dc;
        }

        .shortcut-delete-button {
            padding: 2px 30px;
            background: #d85b52;
            color: #FFFFFF;
            text-align: center;
            cursor: pointer;
            border-radius: 3px;

            &:hover {
                background: #aa3030;
            }
        }

        .close {
            display: flex;
            align-self: flex-end;
            color: #CECECE;
            padding: 10px;
            background-color: transparent;
            border: none;
            cursor: pointer;
            outline: none;
        }
    }

</style>
<script type="es6">
    import moment from "moment";
    import mixin from "../js/mixin.js";

    export default{
        name: 'bound-view',
        data(){
            return {
                showDeleteModal: false,
            };
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