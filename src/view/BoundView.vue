<template>
    <div class="bound-view">
        <section class="bound-section">
            <div class="shortcut-info-header">
                <div class="shortcut-info-comment">
                    <span><img class="shortcut-favicon" :src="shortcut.favicon"/></span>
                    {{shortcut.comment}}
                </div>
                <div class="shortcut-info-title">
                    {{ shortcut.title }}
                </div>
            </div>

            <div class="shortcut-info-content">
                <div class="shortcut-info-item">
                    <label>Shortcut:</label>
                    <span v-if="shortcut.primary" class="shortcut">
                        ALT + SHIFT + {{ shortcut.key }}
                    </span>
                    <template v-else>
                        <span class="shortcut">
                            ALT + SHIFT + {{ domainPrimaryShortcut.key }} + {{ shortcut.key }}
                        </span>
                        /
                        <span class="shortcut">ALT + {{ shortcut.key }}</span>
                    </template>
                </div>
                <div class="shortcut-info-item">
                    <label>Stats:</label>
                    used {{ shortcut.open_times | times }}, saved time {{ shortcut.open_times | savedTimes }}
                </div>
                <!--<div class="shortcut-info-item">-->
                <!--<label>Date:</label> {{ shortcut.created_time | date }}, {{shortcut.created_time | fromNow }}-->
                <!--</div>-->
                <div class="shortcut-info-item">
                    <label>Secondary shortcuts:</label> {{ Object.keys(secondaryShortcuts).length }}
                </div>
            </div>
            <shortcut-list v-if="true" :shortcuts="secondaryShortcuts"></shortcut-list>
            <div class="right-corner triangle"></div>
            <img class="right-corner trash-can" src="../img/delete-light.svg" alt=""
                 @click="onShortcutDeleteButtonClick">
        </section>

        <div class="shortcut-delete-modal" v-show="showDeleteModal">
            <i class="close" @click="showDeleteModal=false">X</i>
            <p class="primary-subtitle">
                Feel free to delete the primary shortcut, all secondary shortcuts of the domain still remain.
            </p>
            <div class="shortcut-delete-button"
                 @click="$bus.emit('unbind-shortcut',shortcut);showDeleteModal=false;">
                <span><img style="vertical-align: middle;" src="../img/delete-white.svg" alt=""></span>
                Sure, delete it!
            </div>
        </div>
    </div>
</template>
<style lang="less">
    @import "../less/_common.less";

    .bound-view {
        position: relative;
    }

    .bound-section {
        width: 380px;
        margin: auto;
        margin-bottom: 20px;

        .shortcut-info-header {
            align-items: center;
            margin: 10px 0 25px;
        }

        .shortcut-info-item {
            margin: 10px 0;
            color: #515151;
            white-space: nowrap;
            font-size: 15px;

            label {
                font-weight: 500;
            }
        }

        .shortcut-info-comment {
            font-weight: 500;
            color: #333;
            font-size: 18px;
            margin: 5px;
        }

        .shortcut-info-title {
            font-size: 14px;
            color: #8e8e8e;
            white-space: normal;
        }

        .shortcut-info-content {
            margin: 0 20px;
            text-align: left;
        }

    }

    .right-corner {
        position: absolute;
        right: 0;
        top: 0;
        margin: 0;
    }

    .triangle {
        width: 80px;
        height: 80px;
        background-color: #f4f4f4;
        transform: translate(50%, -50%) rotate(135deg);
        z-index: 0;
    }

    .trash-can {
        .delete-button;
        padding: 8px;
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
    import timeago from "timeago.js";
    import ShortcutList from "../component/ShortcutList.vue";

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
            },
            domainPrimaryShortcut: {
                type: Object,
                default: function() {
                    return {};
                }
            },
            secondaryShortcuts: {
                type: Object,
            }
        },
        components: {
            ShortcutList,
        },
        filters: {
            times: function(times) {
                return times + (times > 1 ? ' times' : ' time');
            },
            fromNow: function(time) {
                return timeago().format(time);
            },
            date: function(timestamp) {
                return new Date(timestamp).toLocaleDateString();
            },
            savedTimes: function(openTimes) {
                let savedSecond = openTimes * 3;

                if (savedSecond === 0) {
                    return '0 second';
                }

                if (savedSecond < 60 * 5) {
                    return savedSecond + ' seconds';
                }

                return savedSecond / 60.0 + ' minutes';
            }
        },
        methods: {
            onShortcutDeleteButtonClick: function() {
                if (this.shortcut.primary) {
                    if (Object.keys(this.secondaryShortcuts).length) {
                        this.showDeleteModal = true;
                    } else {
                        this.$bus.emit('unbind-shortcut', this.shortcut);
                        this.showDeleteModal = false;
                    }
                } else {
                    this.$bus.emit('unbind-shortcut', this.shortcut);
                }
            },
        }
    }
</script>