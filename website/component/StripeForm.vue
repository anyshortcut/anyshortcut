<template>
    <div class="section">
        <div class="form-title">
            <span>Enter your payment details securely</span>
            <span><img src="/static/img/padlock.png" alt=""></span>
        </div>
        <form action="#" @submit="onSubmit">
            <div class="group">
                <label>
                    <span>Name</span>
                    <input name="cardholder-name" class="field" placeholder="Jane Doe"
                           v-model="cardholderName" required/>
                </label>
            </div>
            <div class="group">
                <label>
                    <span>Card</span>
                    <div id="card-element" class="field"></div>
                </label>
            </div>
            <button id="submit-button" type="submit" class="button is-primary">
                {{ buttonText }}
            </button>
            <div class="outcome">
                <div class="error" role="alert"></div>
                <div class="success"></div>
            </div>
            <a href="https://stripe.com" target="_blank">
                <img src="/static/img/powered-by-stripe.svg" alt="">
            </a>
        </form>
    </div>
</template>

<script>
    import config from "@/js/config.js";

    export default {
        name: "StripeForm",
        data() {
            return {
                stripe: Stripe(config.stripeKey),
                cardholderName: null,
                card: null,
            }
        },
        props: {
            buttonText: {
                type: String,
                default() {
                    return 'Pay Now'
                }
            }
        },
        methods: {
            setPaymentOutcome(outcome, error = false) {
                let submitButton = document.getElementById('submit-button');
                let successElement = this.$el.querySelector('.outcome .success');
                let errorElement = this.$el.querySelector('.outcome .error');

                submitButton.classList.remove('is-loading');
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
            onSubmit(event) {
                event.preventDefault();
                let submitButton = document.getElementById('submit-button');
                submitButton.classList.add('is-loading');

                let extraDetails = {
                    name: this.cardholderName,
                };
                this.stripe.createToken(this.card, extraDetails).then(result => {
                    if (result.token) {
                        this.$emit('on-stripe-token-created', result.token);
                    } else if (result.error) {
                        this.setPaymentOutcome(result.error.message, true);
                    }
                });
            }
        },
        mounted() {
            let elements = this.stripe.elements();

            this.card = elements.create('card', {
                style: {
                    base: {
                        iconColor: '#666EE8',
                        color: '#31325F',
                        lineHeight: '40px',
                        fontWeight: 300,
                        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                        fontSize: '15px',
                        '::placeholder': {
                            color: '#CFD7E0',
                        },
                    },
                }
            });
            this.card.mount('#card-element');

            this.card.on('change', event => {
                if (event.error) {
                    this.setPaymentOutcome(event.error.message, true);
                } else {
                    this.setPaymentOutcome();
                }
            });
        },
    }
</script>

<style>
    form {
        width: 480px;
        margin: 20px auto;
    }

    .form-title {
        font-size: 17px;
        line-height: 30px;
        font-family: 'Poppins', sans-serif;
        font-weight: 500;
        color: #527FE5;
        letter-spacing: 0;
    }

    .group {
        background: white;
        box-shadow: 0 7px 14px 0 rgba(49, 49, 93, 0.10),
        0 3px 6px 0 rgba(0, 0, 0, 0.08);
        border-radius: 4px;
        margin-bottom: 20px;
    }

    label {
        position: relative;
        color: #8898AA;
        font-weight: 300;
        height: 40px;
        line-height: 40px;
        margin-left: 20px;
        display: block;
    }

    .group label:not(:last-child) {
        border-bottom: 1px solid #F0F5FA;
    }

    label > span {
        width: 20%;
        text-align: right;
        float: left;
    }

    .field {
        background: transparent;
        font-weight: 300;
        border: 0;
        color: #31325F;
        outline: none;
        padding-right: 10px;
        padding-left: 10px;
        cursor: text;
        width: 70%;
        height: 40px;
        float: right;
    }

    .field::-webkit-input-placeholder {
        color: #CFD7E0;
    }

    .field::-moz-placeholder {
        color: #CFD7E0;
    }

    .field:-ms-input-placeholder {
        color: #CFD7E0;
    }

    button {
        float: left;
        display: block;
        background: #666EE8;
        color: white;
        box-shadow: 0 7px 14px 0 rgba(49, 49, 93, 0.10),
        0 3px 6px 0 rgba(0, 0, 0, 0.08);
        border-radius: 4px;
        border: 0;
        margin-top: 20px;
        font-size: 15px;
        font-weight: 400;
        width: 100%;
        height: 40px;
        line-height: 38px;
        outline: none;
    }

    button:focus {
        background: #555ABF;
    }

    button:active {
        background: #43458B;
    }

    .outcome {
        float: left;
        width: 100%;
        padding: 10px 0 20px;
        min-height: 24px;
        text-align: center;
    }

    .success, .error {
        visibility: hidden;
        font-size: 13px;
    }

    .success.visible, .error.visible {
        visibility: visible;
        display: inline;
    }

    .error {
        color: #E4584C;
    }

    .success {
        color: #666EE8;
    }

    .success .token {
        font-weight: 500;
        font-size: 13px;
    }
</style>