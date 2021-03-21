<template>
    <div class="shortcut-list-view">
        <div>
            <div class="pipe-title subtitle">
                Primary shortcuts
                <small class="text">total: {{ primaries && primaries.length }}</small>
            </div>
            <shortcut-list :shortcuts="primaries">
                <img class="empty-grey-balloons" alt="">
                <p>No primary shortcut bound yet.</p>
            </shortcut-list>
        </div>
        <div>
            <div class="pipe-title subtitle">
                Compound shortcuts
                <small class="text">total: {{ compounds && compounds.length }}</small>
            </div>
            <shortcut-list :shortcuts="compounds">
                <img class="empty-grey-balloons" alt="">
                <p>No compound shortcut bound yet.</p>
            </shortcut-list>
        </div>
    </div>
</template>
<style lang="scss" scoped>
    .shortcut-list-view {
        padding: 30px 0;
        display: flex;
        justify-content: space-between;

        & > div {
            width: 46%;
        }
    }

    div.pipe-title {
        display: flex;

    }

    small.text {
        margin-left: auto;
        color: #999999;
    }
</style>
<script>
    import client from "@/js/client.js";
    import ShortcutList from "@/component/ShortcutList.vue";

    export default {
        name: "Primary",
        data() {
            return {
                // https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats
                primaries: null,
                compounds: null,
            }
        },
        components: {
            ShortcutList,
        },
        created() {
            client.getAllPrimaryShortcuts().then(shortcuts => {
                this.primaries = shortcuts;
            });
            client.getAllCompoundShortcuts().then(shortcuts => {
                this.compounds = shortcuts;
            }).then(error => {
            });
        }
    }

</script>
