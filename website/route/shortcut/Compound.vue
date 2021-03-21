<template>
    <div>
        <shortcut-list :shortcuts="compounds">
            <img class="empty-grey-balloons" alt="">
            <p>No shortcuts bound yet.</p>
        </shortcut-list>
    </div>
</template>
<style lang="scss" scoped>
</style>
<script type="es6">
    import client from "@/js/client.js";
    import ShortcutList from "@/component/ShortcutList.vue";

    export default {
        name: "Compound",
        data() {
            return {
                compounds: null,
            }
        },
        components: {
            ShortcutList,
        },
        created() {
            client.getAllCompoundShortcuts().then(shortcuts => {
                this.compounds = shortcuts;
            }).then(error => {
            });
        }
    }
</script>