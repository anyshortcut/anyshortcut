<template>
    <div class="redeem-card">
        <div class="skewed-container" :class="skewedClass">
            <div>
                <span class="amount-off">{{ redeem.amount | dollar }} off</span>
                <span>Code: <span>{{ redeem.code.toUpperCase() }}</span></span>
            </div>
            <div>
                <div>
                    <div v-if="redeem.expire_at">
                        Valid until {{ redeem.expire_at | date }}
                    </div>
                    <div v-else>
                        
                    </div>
                    <div>{{ redeem.title }}</div>
                </div>
                <i class="icon-present" aria-hidden="true" style="font-size: 26pt"></i>
            </div>
        </div>
        <div class="description-container">
            {{ redeem.description }}
        </div>
    </div>
</template>
<style lang="scss" scoped>
    $card-width: 320px;

    .redeem-card {
        width: $card-width;
        height: 160px;
        border-radius: 5px 5px 5px 5px;
        box-shadow: 0 5px 21px 0 rgba(128, 128, 128, 0.2);
        font-family: "Poppins", sans-serif;
    }

    .skewed-container {
        flex-direction: column;
        justify-content: space-between;
        display: flex;
        width: 100%;
        height: 120px;
        color: #FFFFFF;
        position: relative;
        padding: 10px 20px;
        font-weight: 500;
        font-size: 15px;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;

        &:after {
            content: '';
            width: 0;
            height: 0;
            border-left: $card-width solid transparent;
            position: absolute;
            top: 100%;
            color: #ffffff;
            left: 0;
        }

        & > div {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .amount-off {
            font-size: 28px;
            font-weight: 600;
        }
    }

    .description-container {
        margin-top: 13px;
        padding: 0 20px;
        color: #333333;
        font-size: 14px;
    }

    .blue {
        background-color: #1882ef;

        &:after {
            border-top: 10px solid #1882ef;
        }
    }

    .light-blue {
        background-color: rgba(24, 130, 239, 0.33);

        &:after {
            border-top: 10px solid rgba(24, 130, 239, 0.33);
        }
    }

    .grey {
        background-color: rgba(221, 221, 221, 0.33);

        &:after {
            border-top: 10px solid rgba(221, 221, 221, 0.33);
        }
    }
</style>
<script>
    export default {
        name: "RedeemCard",
        props: {
            redeem: {
                type: Object,
                required: true,
                default() {
                    return null;
                }
            },
        },
        computed: {
            skewedClass() {
                if (this.redeem.used) {
                    return {
                        'light-blue': true,
                    }
                }

                if (this.redeem.expire_at && this.redeem.expire_at < Date.now()) {
                    return {
                        'grey': true,
                    }
                } else {
                    return {
                        'blue': true,

                    }
                }
            }
        }
    }
</script>