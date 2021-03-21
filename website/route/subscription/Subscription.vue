<template>
    <div>
        <template v-if="subscription.status==='trialing'">
            <div class="subtitle section has-text-centered">❤️ You are in trialing! 🤗👏👏</div>
            <trialing-panel></trialing-panel>
        </template>

        <template v-else-if="subscription.status==='active'">
            <div class="subtitle section has-text-centered">
                ❤️ Thanks for subscribing! Love you!🍻🎉🎉
            </div>
            <active-panel :subscription="subscription"></active-panel>
        </template>
        <!-- TODO check user default_source true case: such as credit card expired failed to charge -->
        <template v-else-if="['past_due','unpaid'].includes(subscription.status)">
            <template v-if="$info.default_source">
                <div class="subtitle section has-text-centered">
                    We are sorry you have an failed charge (unpaid subscription) ! 😥😥
                </div>
                <active-panel :subscription="subscription"></active-panel>
            </template>
            <template v-else>
                <div class="subtitle section has-text-centered">
                    We are sorry your free trial expired! 😥😥
                </div>
                <trialing-panel></trialing-panel>
            </template>
        </template>
    </div>
</template>
<style lang="css">
</style>
<script type="es6">
    import config from "@/js/config.js";
    import client from "@/js/client.js";

    import TrialingPanel from "@/view/TrialingPanel.vue";
    import ActivePanel from "@/view/ActivePanel.vue";

    export default {
        name: "Subscription",
        data() {
            return {
                subscription: {},
            }
        },
        components: {
            TrialingPanel,
            ActivePanel,
        },
        created() {
            client.getUserSubscription().then(subscription => {
                this.subscription = subscription;
            }).catch(error => {
                console.log(error);
            });
        },
    }
</script>