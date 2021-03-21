<template>
    <div class="shortcut-detail-modal" @click="$emit('shortcut-modal-close')">
        <div class="shortcut-detail-container" @click="$event.stopPropagation()">
            <div class="left">
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
                    <p class="text">linked with <span
                            class="shortcut-key">ALT + {{ shortcut.key }}</span></p>
                </div>
                <div class="skewed-container">
                    <div class="entry">
                        <i class="icon-chart" aria-hidden="true"></i>
                        <p>Used times: <span>{{ shortcut.open_times }}</span></p>
                    </div>
                    <div class="entry">
                        <i class="icon-clock" aria-hidden="true"></i>
                        <p>Saved time: <span>{{ shortcut.open_times | savedTimes}}</span></p>
                    </div>
                    <canvas id="chart" width="360" height="220"></canvas>
                </div>
            </div>
            <div class="right">
                <div class="text right-panel-header">
                    <div>
                        Secondary shortcut list
                    </div>
                    <div class="close" @click="$emit('shortcut-modal-close')">X</div>
                </div>
                <shortcut-list
                        :shortcuts="shortcuts"
                        type="'small">
                    <img class="empty-grey-balloons" alt="">
                    <p>No secondary shortcut bound yet</p>
                </shortcut-list>
            </div>
        </div>
    </div>
</template>
<style lang="scss" scoped>
    .shortcut-detail-modal {
        box-sizing: border-box;
        background: rgba(102, 102, 102, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        position: fixed;
        margin: 0 auto;
        right: 0;
        top: 0;
        bottom: 0;
        left: 0;
        z-index: 999;
        transition: opacity .2s ease-in;
    }

    .shortcut-detail-container {
        position: relative;
        width: 800px;
        height: 500px;
        margin: auto;
        overflow: hidden;
        border-radius: 5px 5px 5px 5px;
        box-shadow: 0 5px 21px 0 rgba(128, 128, 128, 0.2);
    }

    .left {
        position: relative;
        width: 50%;
        height: 100%;
        border-radius: 5px 0 0 5px;
        float: left;
        background-color: #FEFEFE;

        .top-container {
            padding: 20px 20px 0;
            border-right: #ececec solid 1px;
            overflow: hidden;
            white-space: nowrap;

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
        background-color: #fefefe;
        width: 50%;
        height: 100%;
        float: left;
        border-radius: 0 5px 5px 0;

        .right-panel-header {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding: 0 15px;
            border-bottom: #ececec solid 1px;

            .close {
                color: #CECECE;
                padding: 10px;
                background-color: transparent;
                border: none;
                cursor: pointer;
                outline: none;
            }
        }

        & > ul {
            padding-bottom: 50px;
            overflow-x: hidden;
            overflow-y: auto;
            height: 100%;
        }
    }

</style>
<script>
    import client from "@/js/client.js";
    import ShortcutList from "@/component/ShortcutList.vue";
    import Chart from "chart.js";

    export default {
        name: "ShortcutDetail",
        data() {
            return {
                shortcuts: null,
            }
        },
        props: {
            shortcut: {
                type: Object,
                required: true,
                default() {
                    return {};
                }
            }
        },
        components: {
            ShortcutList,
        },
        methods: {
            renderChart(data) {
                let chart = document.getElementById('chart');

                Chart.defaults.global.defaultFontColor = '#FFFFFF';
                Chart.defaults.global.defaultFontFamily = "'Open Sans', sans-serif";
                new Chart(chart, {
                    type: 'bar',
                    data: {
                        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                        datasets: [{
                            // label: '# of times',
                            data: data,
                            backgroundColor: 'rgba(255,255,255,0.33)',
                            hoverBackgroundColor: 'rgba(251, 251, 251, 0.33)',
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
                                barPercentage: 0.6,
                                gridLines: {
                                    display: false,
                                }
                            }],
                            yAxes: [{
                                ticks: {
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
            }
        },
        created() {
            client.getSecondaryShortcuts(this.shortcut.id)
                .then(shortcuts => {
                    this.shortcuts = shortcuts;
                }).catch(error => {
            });
            client.getShortcutWeekStats(this.shortcut.id)
                .then(data => {
                    const times = [];
                    for (let i = 0; i < 7; i++) {
                        times.push(data[i + 1] || 0);
                    }
                    this.renderChart(times);
                }).catch(error => {
            });
        }
    }
</script>
