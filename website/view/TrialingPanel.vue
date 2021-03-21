<template>
    <div class="subscribe-view-content">
        <div class="receipt-panel section">
            <table class="table" style="width:100%">
                <caption class="subtitle">
                    Receipt
                </caption>
                <thead>
                <tr>
                    <th>Description</th>
                    <th class="t-align-right">Amount</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>Annual USD 9.99 plan</td>
                    <td class="t-align-right">{{ receipt.subtotal | dollar }}</td>
                </tr>
                <tr>
                    <td>Subtotal</td>
                    <td class="t-align-right">{{ receipt.subtotal | dollar }}</td>
                </tr>
                <tr>
                    <td>Redeem</td>
                    <td class="t-align-right">
                        <div v-if="redeem">
                            <span>
                                <img id="tooltip-redeem-code" class="info-img"
                                     src="/static/img/info-grey.svg" alt="info">
                            </span>
                            -{{ receipt.redeem | dollar }}
                        </div>
                        <div v-else>
                            <input class="input" type="text" placeholder="Redeem code"
                                   v-model="redeemCode">
                            <div class="button is-small is-primary"
                                 @click="applyRedeem">
                                Apply
                            </div>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>Total</td>
                    <td class="t-align-right">{{ receiptTotal | dollar }}</td>
                </tr>
                </tbody>
            </table>
            <div class="outcome">
                <div class="error" role="alert"></div>
                <div class="success"></div>
            </div>
            <popover :ref-id="'tooltip-redeem-code'"
                     v-if="redeem">
                <redeem-card :redeem="redeem"></redeem-card>
            </popover>
        </div>
        <stripe-form ref="stripe" class="subscribe-form"
                     @on-stripe-token-created="onStripeTokenCreated">
        </stripe-form>
    </div>
</template>
<style lang="css">
    .subscribe-view-content {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
    }

    .receipt-panel {
        display: inline-block;
        width: 500px;
    }

    .t-align-right {
        text-align: right !important;
    }

    .subscribe-form {
        display: inline-block;
        text-align: center;
    }
</style>
<script type="es6">
    import client from "@/js/client.js";

    import StripeForm from "@/component/StripeForm.vue";
    import Popover from "@/component/Popover.vue";
    import RedeemCard from "@/component/RedeemCard.vue";

    export default {
        name: "TrialingPanel",
        data() {
            return {
                receipt: {
                    subtotal: 999,
                    redeem: 0,
                },
                redeemCode: null,
                redeem: null,
                card: {
                    holderName: null,
                }
            }
        },
        components: {
            StripeForm,
            Popover,
            RedeemCard,
        },
        computed: {
            receiptTotal: function () {
                return Math.max(0, this.receipt.subtotal - this.receipt.redeem);
            }
        },
        methods: {
            applyRedeem() {
                if (this.redeemCode) {
                    client.checkRedeem(this.redeemCode).then(redeem => {
                        this.redeem = redeem;
                        this.receipt.redeem = redeem.amount;
                        this.setReceiptOutcome();
                    }).catch(error => {
                        this.setReceiptOutcome(error.message, true);
                    });
                }
            },
            setReceiptOutcome(outcome, error = false) {
                let successElement = this.$el.querySelector('.receipt-panel .success');
                let errorElement = this.$el.querySelector('.receipt-panel .error');

                successElement.classList.remove('visible');
                errorElement.classList.remove('visible');

                if (outcome) {
                    if (error) {
                        errorElement.classList.add('visible');
                    } else {
                        successElement.classList.add('visible');
                    }
                    errorElement.textContent = outcome;
                }
            },
            onStripeTokenCreated(token) {
                // Use the token to create a charge or a customer
                // https://stripe.com/docs/charges
                let redeemCode = this.redeem ? this.redeem.code : null;
                client.submitStripeToken(token.id, redeemCode).then(data => {
                    this.$refs.stripe.setPaymentOutcome('Pay Success! You are refreshing...');
                    window.location.reload();
                }).catch(error => {
                    // Error happened! Such as user card declined...
                    this.$refs.stripe.setPaymentOutcome(error.message, true);
                });
            },
        },
    }
</script>