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
        name: "ShortcutHome",
        data() {
            return {
                routes: [
                    {name: 'profile', text: 'API Access'},
                ],
            }
        },
        components: {
            RouterLinkBar,
        },
    }
</script>