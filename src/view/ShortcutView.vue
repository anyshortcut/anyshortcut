<template>
    <div class="shortcut-view">
        <div class="shortcut-detail-container" @click.stop="showPrimaryKeyboard=showSecondaryKeyboard=false">
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
                    <p class="text">linked with
                        <shortcut-key :key-char="domainShortcut.key">
                        </shortcut-key>
                    </p>
                </div>
                <div class="skewed-container">
                    <div class="entry">
                        <i class="icon-chart" aria-hidden="true"></i>
                        <p>Used times: <span>{{ domainShortcut.open_times }}</span></p>
                    </div>
                    <div class="entry">
                        <i class="icon-clock" aria-hidden="true"></i>
                        <p>Saved time: <span>{{ domainShortcut.open_times | savedTimes}}</span></p>
                    </div>
                    <canvas id="primary-chart" width="360" height="220"></canvas>
                </div>
            </div>
            <div class="right">
                <secondary-shortcut-card :shortcut="shortcut" v-if="currentShortcutType==='secondary'">
                </secondary-shortcut-card>
                <shortcut-list :shortcuts="secondaryShortcuts">
                </shortcut-list>
            </div>
        </div>

        <bind-view v-if="showPrimaryKeyboard" class="primary-keyboard"></bind-view>

        <img class="keyboard-icon-left" src="../img/keyboard-icon.svg" alt="keyboard-icon"
             @click.stop="showPrimaryKeyboard=!showPrimaryKeyboard">

        <secondary-bind v-if="showSecondaryKeyboard"
                        class="secondary-keyboard"
                        :domain-shortcut="domainShortcut"
                        :shortcuts="secondaryShortcuts"
                        @click="$event.stopPropagation()">
        </secondary-bind>
        <img class="keyboard-icon-right" src="../img/keyboard-icon.svg" alt="keyboard-icon"
             @click.stop="showSecondaryKeyboard=!showSecondaryKeyboard">
    </div>
</template>

<script>
    import client from "../js/client.js";
    import ShortcutList from "@/component/ShortcutList.vue";
    import ShortcutKey from "../component/ShortcutKey.vue";
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
                shortcut: null,
                secondaryShortcuts: {},
                showPrimaryKeyboard: false,
                showSecondaryKeyboard: false,
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
            renderChart(data) {
                let chart = document.getElementById('primary-chart');

                let chartFontColor = '#FEFEFE';
                Chart.defaults.global.defaultFontFamily = "'Poppins', sans-serif";
                new Chart(chart, {
                    type: 'bar',
                    data: {
                        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                        datasets: [{
                            // label: '# of times',
                            data: data,
                            backgroundColor: 'rgba(255,255,255,0.33)',
                            hoverBackgroundColor: 'rgba(251, 251, 251, 0.25)',
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
                                ticks: {
                                    fontColor: chartFontColor,
                                    beginAtZero: true,
                                    suggestedMin: 0,
                                    suggestedMax: 5,
                                },
                                gridLines: {
                                    display: false,
                                }
                            }]
                        }
                    }
                });
            },
        },
        created() {
            this.queryShortcuts().then(() => {
                client.getShortcutWeekStats(this.domainShortcut.id)
                    .then(data => {
                        const times = [];
                        for (let i = 0; i < 7; i++) {
                            times.push(data[i + 1] || 0);
                        }
                        this.renderChart(times);
                    }).catch(error => {
                });
            });
        },
        mounted() {
            this.$bus.on('refresh', this.queryShortcuts)
        }
    }

</script>

<style lang="scss" scoped>

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
                margin-top: 15px;
                margin-bottom: 5px;
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
            padding: 20px;
            text-align: start;

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

            .entry {
                overflow: hidden;
                margin-top: 20px;
                margin-left: 35px;
                font-size: 15px;

                & > i {
                    margin-top: 4px;
                    margin-right: 15px;
                    float: left;
                    color: #b4d8fc;
                }

                & > p > span {
                    font-family: "Poppins", sans-serif;
                    font-weight: 500;
                    letter-spacing: 1px;
                    padding: 0 10px;
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
        box-sizing: content-box;
        background-color: #FFFFFF;
        border-top: #6BADF2 solid 5px;
        border-radius: 5px 5px 0 0;
        box-shadow: 0 5px 21px 0 rgba(128, 128, 128, 0.2);
        z-index: 999;
    }

    .primary-keyboard {
        @extend .popup-keyboard;
        width: 560px;
        position: fixed;
        bottom: 30px;
        left: 40px;
    }

    .secondary-keyboard {
        @extend .popup-keyboard;
        width: 560px;
        position: fixed;
        bottom: 30px;
        right: 40px;
    }

    .keyboard-icon-right {
        position: fixed;
        bottom: 0;
        right: 5px;
        z-index: 999;
        cursor: pointer;

        &:hover {
            content: url("../img/keyboard-icon-blue.svg");
        }
    }

    .keyboard-icon-left {
        position: fixed;
        bottom: 0;
        left: 5px;
        z-index: 999;
        cursor: pointer;

        &:hover {
            content: url("../img/keyboard-icon-white.svg");
        }
    }

</style>