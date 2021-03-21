<template>
    <div class="subscription-container">
        <div class="left">
            <div class="info-box">
                <div class="receipt">
                    Receipt for <br><span>Anyshortcut</span>
                </div>
                <div class="entry">
                    <i class="icon-wallet" aria-hidden="true"></i>
                    <p>Amount:<br><span>{{ subscription.plan.amount | dollar }} USD</span></p>
                </div>
                <div class="entry">
                    <i class="icon-calendar" aria-hidden="true"></i>
                    <p>Date:<br><span>{{ subscription.created * 1000 | date }}</span></p>
                </div>
                <div class="entry">
                    <i class="icon-star" aria-hidden="true"></i>
                    <p>Issuer:<br><span>{{ subscription.plan.statement_descriptor }}</span></p>
                </div>
                <div class="entry">
                    <i class="icon-notebook" aria-hidden="true"></i>
                    <p>Subscription Nr:<br><span>{{ subscription.id }}</span></p>
                </div>
            </div>
        </div>
        <div class="right">
            <div class="sub-header">
                <img src="/static/img/stripe.svg">
            </div>
            <div class="subtitle" style="margin-top: 35px;text-align: center;">
                Anyshortcut subscription (1 year)
            </div>
            <div class="sub-message">
                <table class="table" style="width: 100%">
                    <tr>
                        <td>Status:</td>
                        <td class="t-align-right">{{ subscription.status | capitalize }}</td>
                    </tr>
                    <tr>
                        <td>Email:</td>
                        <td class="t-align-right">{{ $info.user.email }}</td>
                    </tr>
                    <tr>
                        <td>Period start:</td>
                        <td class="t-align-right">
                            {{ subscription.current_period_start * 1000 | date }}
                        </td>
                    </tr>
                    <tr>
                        <td>Period end:</td>
                        <td class="t-align-right">
                            {{ subscription.current_period_end * 1000 | date }}
                        </td>
                    </tr>
                    <tr>
                        <td>Billing:</td>
                        <td class="t-align-right">Charge automatically</td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</template>
<style lang="css" scoped>

    .subscription-container {
        min-width: 725px;
        max-width: 800px;
        min-height: 450px;
        margin: auto;
        overflow: hidden;
        border-radius: 5px 5px 5px 5px;
        box-shadow: 0 5px 21px 0 rgba(128, 128, 128, 0.2);
    }

    .left {
        background-color: #1882ef;
        width: 35%;
        height: 460px;
        border-radius: 5px 0 0 5px;
        float: left;
        color: #ffffff;
    }

    .info-box {
        margin-top: 35px;
        margin-left: 35px;
        margin-right: 35px;
    }

    .receipt {
        font-weight: 300;
        font-size: 15px;
        line-height: 26px;
        padding-top: 10px;
        padding-bottom: 15px;
        border-bottom: 1px solid #3895f4;
        height: 15%;
    }

    .receipt > span {
        font-weight: 500;
        font-size: 21px;
    }

    .entry {
        border-bottom: 1px solid #3895f4;
        height: 15%;
        overflow: hidden;
        padding-top: 15px;
    }

    .entry > p {
        font-weight: 300;
        font-size: 13px;
        line-height: 26px;
        margin-top: 0 !important;
        float: left;
    }

    .entry > i {
        margin-top: 4px;
        margin-right: 13px;
        float: left;
        color: #b4d8fc;
    }

    span {
        font-weight: 500;
        font-size: 16px;
    }

    .entry:last-child {
        border-bottom: none;
    }

    .right {
        background-color: #fefefe;
        width: 65%;
        height: 100%;
        float: left;
        border-radius: 0 5px 5px 0;
        padding: 50px 40px 0;
    }

    .sub-header {
        overflow: hidden;
        border-bottom: 1px solid #d7e2e7;
        height: 50px;
    }

    .sub-header > img {
        width: 100px;
        float: left;
    }

    .sub-message {
        margin-top: 40px;
        font-weight: 400;
        font-size: 15px;
        color: #7a838d;
        line-height: 30px;
    }

</style>
<script type="es6">
    import config from "@/js/config.js";
    import client from "@/js/client.js";

    export default {
        name: "ActivePanel",
        data() {
            return {}
        },
        props: {
            subscription: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        methods: {},
    }
</script>