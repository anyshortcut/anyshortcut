<template>
    <div class="payment-method-router">
        <div v-if="$info.subscription.status === 'trialing'"
             class="section has-text-centered">
            <p class="subtitle">
                You are in trialing
            </p>
            <small class="subtext">
                No payment method here, please subscribe first.
            </small>
        </div>
        <div class="section has-text-centered" v-else>
            <div v-if="$info.default_source">
                <p class="subtitle">You already added your credit card</p>
                <p class="subtext">
                    You can update your credit card in anytime.
                </p>
                <div class="stripe-form-extras-margin-top">
                    <stripe-form ref="stripe"
                                 :button-text="'Update my credit card'"
                                 @on-stripe-token-created="onStripeTokenCreated"
                                 v-if="updateSource">
                    </stripe-form>
                    <div v-else-if="source" class="section">
                        <div class="credit-card" style="z-index: 30;">
                            <div class="credit-card-container">
                                <div class="credit-card-shadow"></div>
                                <div class="credit-card-layers">
                                    <div class="credit-card-rendered-layer"
                                         style="background: rgb(45, 119, 255);">
                                    </div>
                                    <div class="credit-card-rect">
                                        <div class="triangle-1"></div>
                                        <div class="triangle-2"></div>
                                        <div class="triangle-3"></div>
                                    </div>
                                </div>
                                <div class="credit-card-content">
                                    <span class="brand">{{ source.brand }}</span>
                                    <p class="number">**** **** **** {{ source.last4 }}</p>
                                    <div class="name-and-expire-date">
                                        <span>{{ source.name }}</span>
                                        <span>{{ source.exp_month }} / {{ source.exp_year }}</span>
                                    </div>
                                </div>
                                <div class="credit-card-shine"></div>
                            </div>
                        </div>
                        <div class="button is-primary" @click="updateSource=true"
                             style="margin-top: 50px">
                            Update my credit card
                        </div>
                    </div>
                </div>
            </div>
            <div v-else>
                <p class="subtitle">You have no credit card added</p>
                <small class="subtext">Please add your credit card for next billing renew.</small>
                <stripe-form ref="stripe"
                             class="stripe-form-extras-margin-top"
                             :button-text="'Add my credit card'"
                             @on-stripe-token-created="onStripeTokenCreated">
                </stripe-form>
            </div>
        </div>
    </div>
</template>

<script>
    import StripeForm from "@/component/StripeForm.vue";
    import client from "@/js/client.js";

    export default {
        name: "PaymentMethod",
        data() {
            return {
                source: null,
                updateSource: false,
            }
        },
        components: {
            StripeForm,
        },
        methods: {
            onStripeTokenCreated(token) {
                client.updateUserSource(token.id).then(data => {
                    this.$refs.stripe.setPaymentOutcome('Success! You are refreshing...');
                    window.location.reload();
                }).catch(error => {
                    this.$refs.stripe.setPaymentOutcome(error.message, true);
                });
            }
        },
        created() {
            client.getUserSource().then(data => {
                this.source = data;
            }).catch(error => {
            });
        }
    }
</script>

<style lang="scss" scoped>
    .payment-method-router {
        display: flex;
        justify-content: center;
    }

    .stripe-form-extras-margin-top {
        margin-top: 35px;
    }

    .credit-card {
        height: 260px;
        width: 400px;
        border-radius: 10px;
        position: relative;
    }

    .credit-card-rect {
        position: relative;
        height: 260px;
        width: 400px;
        margin-left: auto;
        margin-right: auto;
        overflow: hidden;
        z-index: 1;
    }

    .triangle-1 {
        top: 97px;
        left: -52px;
        position: absolute;
        transform: skewX(26deg) skewY(-41deg) rotate(188deg);
        width: 361px;
        height: 285px;
        background-color: #2983ff;
        opacity: 0.9;
        z-index: 2;
    }

    .triangle-2 {
        background-color: #2d94ff;
        height: 300px;
        left: 187px;
        right: 0;
        position: absolute;
        z-index: 1;
    }

    .triangle-3 {
        top: 138px;
        left: 200px;
        position: absolute;
        transform: skewX(26deg) skewY(-41deg) rotate(196deg);
        width: 271px;
        height: 190px;
        z-index: 1;
        background-color: #27a3ff;
    }

    .credit-card-content {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        width: 100%;
        height: 100%;
        color: white;
        z-index: 3;
        position: absolute;
        top: 0;
        padding: 15px 25px 15px;
        font-size: 20px;

        .brand {
            color: white;
            font-size: 24px;
            font-family: "Poppins", sans-serif;
            font-weight: 500;
            text-transform: capitalize;
            margin-left: auto;
            margin-right: 10px;
        }

        .number {
            font-size: 24px;
            font-family: "Poppins", sans-serif;
            font-weight: 500;
        }

        .name-and-expire-date {
            display: flex;
            justify-content: space-between;
            padding: 0 10px;
        }
    }

    .credit-card-container {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 5px;
        transition: all 0.2s ease-out;
    }

    .credit-card-layers {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 10px;
        overflow: hidden;
        transform-style: preserve-3d;
    }

    .credit-card-rendered-layer {
        position: absolute;
        width: 104%;
        height: 104%;
        top: -2%;
        left: -2%;
        background-repeat: no-repeat;
        background-position: center;
        background-color: transparent;
        background-size: cover;
        transition: all 0.1s ease-out;
        z-index: -1;
    }

    .credit-card-shadow {
        position: absolute;
        top: 5%;
        left: 5%;
        width: 90%;
        height: 90%;
        transition: all 0.2s ease-out;
        box-shadow: 0 8px 30px rgba(14, 21, 47, 0.6);
    }

    .credit-card-shine {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 10px;
        background: linear-gradient(135deg, rgba(255, 255, 255, .25) 0%, rgba(255, 255, 255, 0) 60%);
    }
</style>