<template>
    <div>
        <section class="bound-section">
            <div class="bound-info">
                <img src="../img/check.svg" alt="" class="bound-icon">
                <p v-if="shortcut.primary" class="primary-text">Primary shortcut:
                    <span class="shortcut" :title="shortcut.title">ALT+SHIFT+{{ shortcut.key }}</span>
                    <span>
                            <img class="delete-button"
                                 @click="showDeleteModal=true"/>
                    </span>
                </p>
                <p class="primary-text" v-else>Secondary shortcut:
                    <span class="shortcut" :title="shortcut.title">ALT+{{ shortcut.key }}</span>
                    <span>
                            <img class="delete-button"
                                 @click="$bus.emit('unbind-shortcut',shortcut)"/>
                    </span>
                </p>
            </div>
            <div class="bound-stats">
                You have open the shortcut <span class="shortcut-property">{{shortcut.open_times}}</span>
                times since <span class="shortcut-property">{{shortcut.created_time | fromNow}}</span>
            </div>
        </section>

        <div class="shortcut-delete-modal" v-show="showDeleteModal">
            <i class="close" @click="showDeleteModal=false">X</i>
            <p class="primary-subtitle">
                Feel free to delete the primary shortcut, all secondary shortcuts of the domain still remain.
            </p>
            <div class="shortcut-delete-button"
                 @click="$bus.emit('unbind-shortcut',shortcut);showDeleteModal=false;">
                Sure, delete it!
            </div>
        </div>
    </div>
</template>
<style lang="less">
    @import "../less/_common.less";

    .bound-section {
        display: flex;
        margin: 20px;

        flex-direction: column;
        justify-content: center;
        align-items: center;

        .bound-info {
            display: flex;
            align-items: center;
        }

        .bound-icon {
            background-color: #67D500;
            width: 30px;
            height: 30px;
            margin: 0 10px;
            border-radius: 50%;
            padding: 5px;
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
        z-index: 99;

        display: flex;
        flex-direction: column;
        align-items: center;
        border-radius: 3px;
        background-color: #ffffff;
        box-shadow: @box-shadow-base;
        font-size: 15px;

        p {
            margin: 0 25px 20px 25px;
        }

        .close {
            .close-button;
            display: flex;
            align-self: flex-end;
        }
    }

</style>
<script type="es6">
    import moment from "moment";

    export default {
        name: 'bound-view',
        data() {
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
    }
</script>