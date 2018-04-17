<template>
    <transition enter-active-class="slideInRight"
                leave-active-class="slideOutRight"
                @after-enter="fetchWeekStats()">
        <div class="shortcut-card" v-if="shortcut">
            <div class="top-container">
                <div class="favicon">
                    <img :src="shortcut.favicon" alt="">
                    <img class="pin" src="../img/pin.svg" alt="pin"
                         :title="'This shortcut has linked to current URL - ' + shortcut.url"
                         v-if="isShortcutPinned">
                </div>
                <div class="content">
                    <a :href="shortcut.url" target="_blank">
                        <div class="subtitle">
                            {{ shortcut.comment }}
                        </div>
                        <small>
                            {{ shortcut.url }}
                        </small>
                    </a>
                </div>
                <p class="text">
                    <template v-if="shortcut.parentKey.length===1">
                        <shortcut-key :key-char="shortcut.key"
                                      :parentKeyChar="shortcut.parentKey">
                        </shortcut-key>
                        <span> / </span>
                    </template>
                    <span class="shortcut">{{ shortcut.key }}</span> in domain pages
                </p>
            </div>
            <div class="skew-line-container">
                <div class="skew-line"></div>
            </div>
            <div class="skewed-container">
                <div class="secondary-stats">
                    <div class="entry"
                         id="secondary-open-times">
                        <i class="icon-chart" aria-hidden="true"></i>
                        <p>{{ shortcut.open_times }}
                            <small>times</small>
                        </p>
                    </div>
                    <popover ref-id="secondary-open-times">
                        <p class="tooltip">
                            You have used this secondary shortcut <b>{{ shortcut.open_times }}</b> times
                        </p>
                    </popover>
                    <div class="entry"
                         id="secondary-save-time">
                        <i class="icon-clock" aria-hidden="true"></i>
                        <p v-if="shortcut.open_times > 100">{{ shortcut.open_times * 3 / 60.0 }}
                            <small>minutes</small>
                        </p>
                        <p v-else>{{ shortcut.open_times * 3 }}
                            <small>seconds</small>
                        </p>
                    </div>
                    <popover ref-id="secondary-save-time">
                        <p class="tooltip" v-if="shortcut.open_times > 100">
                            You have saved <b>{{ shortcut.open_times * 3 / 60.0 }}</b> minutes by this shortcut
                        </p>
                        <p class="tooltip" v-else>
                            You have saved <b>{{ shortcut.open_times * 3 }}</b> seconds by use this shortcut
                        </p>
                    </popover>

                </div>
                <canvas id="secondary-chart" width="360" height="220"></canvas>
                <div class="delete-text" @click="$bus.emit('unbind-shortcut',shortcut)">
                    Delete shortcut?
                </div>
            </div>
            <img class="right-arrow" src="../img/right-arrow.svg" alt="right-arrow" @click="$emit('close')">
        </div>
    </transition>
</template>

<script>
    import client from "../js/client.js";
    import common from "../js/common.js";
    import Chart from "chart.js";
    import ShortcutKey from "../component/ShortcutKey.vue";
    import Popover from "../component/Popover.vue";

    export default {
        name: "SecondaryShortcutCard",
        data() {
            return {
                chart: null,
            };
        },
        props: {
            shortcut: {
                type: Object,
                default() {
                    return {};
                },
            }
        },
        computed: {
            isShortcutPinned() {
                return this.shortcut &&
                    common.isUrlEquivalent(this.shortcut.url, this.$background.activeTab.url)
            }
        },
        components: {
            ShortcutKey,
            Popover,
        },
        methods: {
            renderChart() {
                let chartFontColor = '#1882ef';
                Chart.defaults.global.defaultFontFamily = "'Poppins', sans-serif";
                this.chart = new Chart(document.getElementById('secondary-chart'), {
                    type: 'bar',
                    data: {
                        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                        datasets: [{
                            // label: '# of times',
                            data: [0, 0, 0, 0, 0, 0, 0],
                            backgroundColor: 'rgba(26,132,237,1)',
                            hoverBackgroundColor: 'rgba(26,132,237,0.7)',
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
                                fontColor: chartFontColor,
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
                            }],
                        }
                    }
                });
            },
            fetchWeekStats() {
                client.getShortcutWeekStats(this.shortcut.id)
                    .then(data => {
                        this.chart.data.datasets[0]['data'] = Object.values(data);
                        this.chart.update();
                    }).catch(error => {
                });
            },
        },
        mounted() {
            this.renderChart();
        }
    }
</script>

<style lang="scss" scoped>
    .shortcut-card {
        width: 400px;
        height: 100%;
        background-color: #FFFFFF;

        .top-container {
            padding: 20px 20px 0;
            border-right: #ececec solid 1px;
            overflow: hidden;
            white-space: nowrap;
            text-align: start;

            .favicon {
                position: relative;
                overflow: visible;
                display: inline-block;
                vertical-align: middle;
                min-width: 42px;
                min-height: 42px;
            }

            & .pin {
                position: absolute;
                bottom: -14px;
                right: 0;
                left: 0;
                margin: auto;
                width: 26px;
                height: 26px;
            }

            & .content {
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

        .skew-line-container {
            width: 100%;
            height: 30px;
            padding: 0;
            margin: 0;

            .skew-line {
                width: 402px;
                height: 1px;
                border-bottom: 2px solid #1882ef;
                transform: rotate(4deg) translateY(14px);
                position: absolute;
            }
        }

        $skew-color: #fafafa;
        .skewed-container {
            background-color: $skew-color;
            color: #1882ef;
            height: 100%;
            width: 100%;
            display: block;
            position: relative;
            padding: 15px 20px;

            &:before {
                content: "";
                width: 0;
                height: 0;

                border-right: 200px solid transparent;
                border-bottom: 13px solid $skew-color;
                border-left: 200px solid $skew-color;
                border-top: 13px solid transparent;

                position: absolute;
                bottom: 100%;
                left: 0;
            }

            .secondary-stats {
                display: flex;
                height: 70px;
            }

            .entry {
                overflow: hidden;
                flex: 1;

                & > i {
                    font-size: 18pt;
                    align-self: center;
                    display: inline-block;
                    color: #1882ef;;
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
                color: #6BADF2;
                letter-spacing: 0.6px;
                text-decoration: underline;

                &:hover {
                    color: #1882ef;
                }
            }
        }

        .right-arrow {
            width: 30px;
            cursor: pointer;
            position: absolute;
            top: 0;
            right: 0;
            padding: 0 5px;
        }
    }

    @keyframes slideInRight {
        from {
            transform: translate(100%, 0);
            visibility: visible;
        }

        to {
            transform: translate(0, 0);
        }
    }

    .slideInRight {
        animation-name: slideInRight;
        animation-duration: 0.38s;
        animation-fill-mode: both;
        animation-timing-function: ease-in;
    }

    @keyframes slideOutRight {
        from {
            transform: translate(0, 0);
        }

        to {
            visibility: hidden;
            transform: translate(100%, 0);
        }
    }

    .slideOutRight {
        animation-name: slideOutRight;
        animation-duration: 0.38s;
        animation-fill-mode: both;
        animation-timing-function: ease-out;
    }
</style>