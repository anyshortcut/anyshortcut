<template>
    <div class="redeem-router">
        <div>
            <div class="pipe-title subtitle">Your redeem cards
                <span>
                    <img id="tooltip-exclusive" class="info-img"
                         src="/img/info-grey.svg" alt="info">
                </span>
            </div>
            <ul>
                <li v-for="redeem in redeems">
                    <redeem-card :redeem="redeem"></redeem-card>
                </li>
            </ul>
        </div>
        <div>
            <div class="pipe-title subtitle">
                Claimed by you
                <span>
                    <img id="tooltip-claimed" class="info-img"
                         src="/img/info-grey.svg" alt="info">
                </span>
            </div>
            <ul>
                <li v-for="redeem in reclaimedRedeems">
                    <redeem-card :redeem="redeem"></redeem-card>
                </li>
            </ul>
        </div>
        <div>
            <div class="pipe-title subtitle">Your referral cards
                <span>
                    <img id="tooltip-referral" class="info-img"
                         src="/img/info-grey.svg" alt="info">
                </span>
            </div>
            <ul>
                <li v-for="redeem in referralRedeems">
                    <redeem-card :redeem="redeem"></redeem-card>
                </li>
            </ul>
        </div>
        <popover :ref-id="'tooltip-exclusive'" class="tooltip">
            <p>
                These redeem cards are exclusive to you, feel free to apply before subscribe!
            </p>
        </popover>
        <popover :ref-id="'tooltip-claimed'" class="tooltip">
            <p>These redeem cards were claimed by you, not available anymore!</p>
        </popover>
        <popover :ref-id="'tooltip-referral'" class="tooltip">
            <p>
                You'll get three $6.00 off referral redeem card after every subscribing.
                Another $8.00 off redeem card is a reward for you if these three redeems
                were claimed by your friends.
            </p>
        </popover>
    </div>
</template>
<style lang="scss" scoped>
    .redeem-router {
        padding-top: 30px;
        display: flex;
        justify-content: space-around;

        & > div {
            display: inline-block;
            width: 50%;
        }

        .info-img {
            padding: 0 5px;
        }

        .tooltip {
            padding: 20px;
            font-size: 14px;
            width: 300px;
        }
    }

    ul > li {
        margin: 20px 0;
    }
</style>
<script>
    import client from "@/js/client.js";
    import RedeemCard from "@/component/RedeemCard.vue";
    import Popover from "@/component/Popover.vue";

    export default {
        name: "Redeem",
        data() {
            return {
                redeems: null,
                reclaimedRedeems: null,
                referralRedeems: null,
            }
        },
        components: {
            RedeemCard,
            Popover,
        },
        created() {
            client.getUserOwnedRedeems().then(redeems => {
                this.redeems = redeems;
            });
            client.getUserClaimedRedeems().then(redeems => {
                this.reclaimedRedeems = redeems;
            });
            client.getUserReferralRedeems().then(redeems => {
                this.referralRedeems = redeems;
            });
        }
    }
</script>