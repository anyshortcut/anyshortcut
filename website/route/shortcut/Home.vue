<template>
    <div>
        <router-link-bar :routes="routes"></router-link-bar>
        <router-view></router-view>
        <shortcut-detail
                :shortcut="clickedShortcut"
                @shortcut-modal-close="clickedShortcut=null"
                v-if="clickedShortcut">
        </shortcut-detail>
    </div>
</template>
<style lang="scss" scoped>
</style>
<script type="es6">
    import RouterLinkBar from "@/component/RouterLinkBar.vue";
    import ShortcutDetail from "@/view/ShortcutDetail.vue";

    export default {
        name: "ShortcutHome",
        data() {
            return {
                routes: [
                    {name: 'shortcuts', text: 'Shortcut list'},
                    // {name: 'compound', text: 'Compound shortcuts'},
                ],
                clickedShortcut: null,
            }
        },
        components: {
            RouterLinkBar,
            ShortcutDetail,
        },
        methods: {
            onShortcutKeyClick(shortcut) {
                this.clickedShortcut = shortcut;
            },
        },
        mounted() {
            this.$bus.on('shortcut-key-click', this.onShortcutKeyClick);
            document.addEventListener('keyup', (event) => {
                // Click ESC to dismiss
                if (event.keyCode === 27) {
                    this.clickedShortcut = null
                }
            });
        },
    }
</script>