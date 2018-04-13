<template>
    <div class="shortcut-card">
        <div class="top-container">
            <img :src="shortcut.favicon" alt="">
            <div>
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
                <div class="entry">
                    <i class="icon-chart" aria-hidden="true"></i>
                    <p>{{ shortcut.open_times }} times</p>
                </div>
                <div class="entry">
                    <i class="icon-clock" aria-hidden="true"></i>
                    <p>{{ shortcut.open_times | savedTimes}}</p>
                </div>
            </div>
            <canvas id="secondary-chart" width="360" height="220"></canvas>
            <div class="delete-text" @click="$bus.emit('unbind-shortcut',shortcut)">
                Delete shortcut?
            </div>
        </div>
        <img class="right-arrow" src="../img/right-arrow.svg" alt="right-arrow" @click="$emit('close')">
    </div>
</template>

<script>
    import client from "../js/client.js";
    import Chart from "chart.js";
    import ShortcutKey from "../component/ShortcutKey.vue";

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
        components: {
            ShortcutKey,
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
        },
        mounted() {
            this.renderChart();
            client.getShortcutWeekStats(this.shortcut.id)
                .then(data => {
                    this.chart.data.datasets[0]['data'] = Object.values(data);
                    this.chart.update();
                }).catch(error => {
            });
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
                margin: 12px auto;
                width: 150px;
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
            cursor: pointer;
            position: absolute;
            top: 0;
            right: 0;
            padding: 0 5px;
        }
    }
</style>