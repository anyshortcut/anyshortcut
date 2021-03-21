<template>
    <div>
        <router-link-bar :routes="routes"></router-link-bar>
        <router-view></router-view>
    </div>
</template>
<style lang="scss" scoped>
</style>
<script type="es6">
    import RouterLinkBar from "@/component/RouterLinkBar.vue";

    export default {
        name: "SubscriptionHome",
        data() {
            return {
                routes: [
                    {name: 'subscription', text: 'Subscription'},
                    {name: 'payment-method', text: 'Payment method'},
                    {name: 'redeem', text: 'Redeem'},
                ],
            }
        },
        components: {
            RouterLinkBar,
        },
    }
</script>