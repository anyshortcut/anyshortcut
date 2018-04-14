<template>
    <div class="shortcut-view">
        <div class="shortcut-detail-container">
            <div class="left">
                <div class="top-container">
                    <img :src="domainShortcut.favicon" alt="">
                    <div>
                        <a :href="domainShortcut.url" target="_blank">
                            <div class="subtitle">
                                {{ domainShortcut.comment }}
                            </div>
                            <small>
                                {{ domainShortcut.url }}
                            </small>
                        </a>
                    </div>
                    <p class="text">
                        <shortcut-key :key-char="domainShortcut.key">
                        </shortcut-key>
                    </p>
                </div>
                <div class="skewed-container">
                    <div class="primary-stats">
                        <div class="entry">
                            <i class="icon-graph" aria-hidden="true"></i>
                            <p>{{ totalOpenTimes }} times</p>
                        </div>
                        <div class="entry">
                            <i class="icon-chart" aria-hidden="true"></i>
                            <p>{{ domainShortcut.open_times }} times</p>
                        </div>
                        <div class="entry">
                            <i class="icon-clock" aria-hidden="true"></i>
                            <p>{{ totalOpenTimes | savedTimes}}</p>
                        </div>
                    </div>
                    <canvas id="primary-chart" width="360" height="220"></canvas>
                    <popover :ref-id="'delete-text'">
                        <div class="delete-confirm-popup">
                            <p style="font-size: 16px;font-weight: 600;">Are you sure to delete?</p>
                            <div>
                                <input id="delete-domain-secondaries" type="checkbox"
                                       v-model='includingSecondary'>
                                <label for="delete-domain-secondaries">
                                    including all secondary shortcuts in this domain
                                </label>
                            </div>
                            <div class="shortcut-delete-button"
                                 @click="$bus.emit('unbind-shortcut',domainShortcut,includingSecondary)">
                                Delete
                            </div>
                        </div>
                    </popover>
                    <div id="delete-text" class="delete-text">
                        Delete shortcut?
                    </div>
                </div>
            </div>
            <div class="right">
                <secondary-shortcut-card
                        style="position: absolute;z-index: 9"
                        :shortcut="shortcut" v-if="currentShortcutType==='secondary'"
                        @close="shortcut=null">
                </secondary-shortcut-card>
                <shortcut-list :shortcuts="secondaryShortcuts"
                               @shortcut-key-click="onShortcutListItemClick">
                </shortcut-list>
            </div>
        </div>

        <popover :ref-id="'keyboard-icon-left'" :show-arrow="false">
            <bind-view class="popup-keyboard"></bind-view>
        </popover>
        <img id="keyboard-icon-left" class="keyboard-icon-left" src="../img/keyboard-icon.svg" alt="keyboard-icon">

        <popover :ref-id="'keyboard-icon-right'" :show-arrow="false">
            <secondary-bind class="popup-keyboard"
                            :domain-shortcut="domainShortcut"
                            :shortcuts="secondaryShortcuts">
            </secondary-bind>
        </popover>
        <img id="keyboard-icon-right" class="keyboard-icon-right" src="../img/keyboard-icon.svg" alt="keyboard-icon">
    </div>
</template>

<script>
    import client from "../js/client.js";
    import ShortcutList from "@/component/ShortcutList.vue";
    import ShortcutKey from "../component/ShortcutKey.vue";
    import Popover from "../component/Popover.vue";
    import SecondaryShortcutCard from "../component/SecondaryShortcutCard.vue";
    import SecondaryBind from "../view/SecondaryBind.vue";
    import BindView from "../view/BindView.vue";
    import Chart from "chart.js";
    import common from "../js/common.js";
    import _ from "lodash";

    export default {
        name: "ShortcutView",
        data() {
            return {
                chart: null,
                totalOpenTimes: 0,
                shortcut: null,
                secondaryShortcuts: {},
                includingSecondary: false,
            }
        },
        props: {
            domainShortcut: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        components: {
            ShortcutList,
            ShortcutKey,
            Popover,
            SecondaryBind,
            BindView,
            SecondaryShortcutCard,
        },
        computed: {
            currentShortcutType: function() {
                if (this.shortcut) {
                    if (common.isUrlEquivalent(this.domainShortcut.url, this.shortcut.url)) {
                        return 'domain-primary';
                    } else if (this.shortcut.primary === false) {
                        return 'secondary';
                    }
                }

                return 'none';
            }
        },
        methods: {
            queryShortcuts() {
                this.shortcut = null;

                let activeTab = this.$background.activeTab;
                let primaryShortcuts = _.cloneDeep(this.$background.primaryShortcuts);
                this.secondaryShortcuts = _.cloneDeep(this.$background.getSecondaryShortcutsByUrl(activeTab.url));
                _.forOwn(this.secondaryShortcuts, shortcut => {
                    shortcut['parentKey'] = this.domainShortcut.key;
                });

                // Iterate both primary shortcuts firstly to find the bound shortcut,
                // otherwise to iterate secondary shortcuts to ensure don't miss the bound shortcut.
                this.checkShortcutBound(primaryShortcuts) || this.checkShortcutBound(this.secondaryShortcuts);
                return Promise.resolve();
            },
            checkShortcutBound(shortcuts) {
                let url = this.$background.activeTab.url;
                _.forOwn(shortcuts, shortcut => {
                    if (common.isUrlEquivalent(shortcut.url, url)) {
                        this.shortcut = shortcut;
                        return false;
                    }
                });
            },
            onShortcutListItemClick(shortcut) {
                this.shortcut = shortcut;
            },
            renderChart() {
                let emptyData = [0, 0, 0, 0, 0, 0, 0];
                let chartFontColor = '#FEFEFE';
                Chart.defaults.global.defaultFontFamily = "'Poppins', sans-serif";
                this.chart = new Chart(document.getElementById('primary-chart'), {
                    type: 'bar',
                    data: {
                        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                        datasets: [{
                            type: 'bar',
                            // label: '# of times',
                            data: emptyData,
                            backgroundColor: 'rgba(255,255,255,0.33)',
                            hoverBackgroundColor: 'rgba(251, 251, 251, 0.25)',
                            yAxisID: 'primary',
                        }, {
                            type: 'line',
                            // label: '# of times',
                            data: emptyData,
                            fill: false,
                            borderColor: 'rgba(251, 251, 251, 0.25)',
                            borderWidth: 1.2,
                            yAxisID: 'secondaries',
                        }],
                    },
                    options: {
                        responsive: true,
                        legend: {
                            display: false,
                        },
                        title: {
                            display: true,
                            text: 'Weekly statistics',
                            fontStyle: 'normal',
                            padding: 15,
                            fontColor: chartFontColor,
                            fontSize: 15,
                        },
                        tooltips: {
                            backgroundColor: '#F4F4F4',
                            titleFontColor: '#1882EF',
                            bodyFontColor: '#1882EF',
                        },
                        scales: {
                            scaleLabel: {
                                fontColor: '#B4D8FC',
                            },
                            xAxes: [{
                                ticks: {
                                    fontColor: chartFontColor,
                                },
                                barPercentage: 0.6,
                                gridLines: {
                                    display: false,
                                }
                            }],
                            yAxes: [{
                                id: 'primary',
                                ticks: {
                                    fontColor: chartFontColor,
                                    beginAtZero: true,
                                    suggestedMin: 0,
                                    suggestedMax: 5,
                                },
                                position: 'left',
                                gridLines: {
                                    display: false,
                                }
                            }, {
                                id: 'secondaries',
                                ticks: {
                                    fontColor: chartFontColor,
                                    beginAtZero: true,
                                    suggestedMin: 0,
                                    suggestedMax: 5,
                                },
                                position: 'right',
                                gridLines: {
                                    display: false,
                                }
                            },]
                        }
                    }
                });
            },
        },
        mounted() {
            this.renderChart();
            this.queryShortcuts().then(() => {
                client.getShortcutWeekStats(this.domainShortcut.id).then(data => {
                    this.chart.data.datasets[0]['data'] = Object.values(data);
                    this.chart.update();
                }).catch(error => {
                });

                client.getPrimarySecondaryShortcutWeekStats(this.domainShortcut.id).then(data => {
                    this.chart.data.datasets[1]['data'] = Object.values(data);
                    this.chart.update();

                    this.totalOpenTimes = Object.values(data).reduce((accumulator, currentValue) => accumulator + currentValue);
                });
            });
            this.$bus.on('refresh', this.queryShortcuts);
        }
    }

</script>

<style lang="scss" scoped>
    @import "../scss/_common.scss";

    .shortcut-view {
        box-sizing: border-box;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 auto;
        transition: opacity .2s ease-in;
    }

    .shortcut-detail-container {
        position: relative;
        width: 800px;
        height: 500px;
        margin: auto;
        overflow: hidden;
    }

    .left {
        position: relative;
        width: 50%;
        height: 100%;
        float: left;
        background-color: #FFFFFF;

        .top-container {
            padding: 20px 20px 0;
            border-right: #ececec solid 1px;
            overflow: hidden;
            white-space: nowrap;
            text-align: start;

            & img {
                width: 42px;
                height: 42px;
                display: inline-block;
                vertical-align: middle;
            }

            & > div {
                display: inline-block;
                vertical-align: middle;
                margin-left: 10px;
                max-width: 315px;
                overflow: hidden;
                white-space: nowrap;
            }

            & small {
                padding: 5px 0;
                font-size: 14px;
                color: #999;
            }

            & > p {
                text-align: center;
                margin-top: 12px;
                margin-bottom: 8px;
                letter-spacing: 0.8px;
            }

        }

        .skewed-container {
            background-color: #1882ef;
            color: #FFFFFF;
            height: 100%;
            width: 100%;
            display: block;
            position: relative;
            margin-top: 30px;
            padding: 15px 20px;

            &:before {
                content: '';
                width: 0;
                height: 0;
                border-left: 400px solid transparent;
                border-bottom: 30px solid #1882ef;
                position: absolute;
                bottom: 100%;
                left: 0;
            }

            .primary-stats {
                display: flex;
                height: 70px;
            }

            .entry {
                overflow: hidden;
                flex: 1;

                & > i {
                    color: #b4d8fc;
                    font-size: 18pt;
                    align-self: center;
                    display: inline-block;
                }

                & > p {
                    font-size: 15px;
                    letter-spacing: 0.6px;
                    align-self: center;
                    text-align: center;
                    padding-top: 3px;
                }
            }

            .delete-text {
                margin: 15px auto;
                width: 150px;
                height: 40px;
                display: block;
                cursor: pointer;
                font-size: 13px;
                padding: 5px;
                color: #b4d8fc;
                letter-spacing: 0.6px;
                text-decoration: underline;

                &:hover {
                    color: #FDFDFD;
                }
            }
        }
    }

    .right {
        background-color: #FFFFFF;
        width: 50%;
        height: 100%;
        float: left;

        & > ul {
            padding-bottom: 50px;
            overflow-x: hidden;
            overflow-y: auto;
            height: 100%;
        }
    }

    .popup-keyboard {
        width: 560px;
        box-sizing: content-box;
        background-color: #FFFFFF;
        border-top: #6BADF2 solid 5px;
        border-radius: 5px 5px 0 0;
        box-shadow: 0 5px 21px 0 rgba(128, 128, 128, 0.2);
        z-index: 999;
    }

    @mixin keyboard-icon {
        position: absolute;
        bottom: 0;
        width: 30px;
        height: 30px;
        z-index: 99;
        cursor: pointer;
    }

    .keyboard-icon-right {
        @include keyboard-icon;
        right: 5px;

        &:hover {
            content: url("../img/keyboard-icon-blue.svg");
        }
    }

    .keyboard-icon-left {
        @include keyboard-icon;
        left: 5px;

        &:hover {
            content: url("../img/keyboard-icon-white.svg");
        }
    }

    .delete-confirm-popup {
        width: 388px;
        padding: 15px;
        font-size: 14px;
        color: #dd4814;
        background-color: #fff;
        border-top: 5px solid #6badf2;
        border-radius: 5px 5px 0 0;
        box-shadow: 0 5px 21px 0 hsla(0, 0%, 50%, .2);
        z-index: 999;
    }

    .shortcut-delete-button {
        @include button;
        @include negative-gradient;
        padding: 2px 30px;
        margin-top: 5px;
    }

</style>