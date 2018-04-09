<template>
    <div>
        <primary-bind :shortcuts="shortcuts">
        </primary-bind>
        <compound-bind v-if="prefs.isCompoundShortcutEnable()"
                       :shortcuts="compoundShortcuts">
        </compound-bind>
    </div>
</template>
<style lang="css">

</style>
<script type="es6">
    import PrimaryBind from "../view/PrimaryBind.vue";
    import CompoundBind from "../view/CompoundBind.vue";
    import prefs from "../js/prefs.js";
    import _ from "lodash";

    export default {
        name: 'BindView',
        data() {
            return {
                shortcuts: null,
                compoundShortcuts: null,
                prefs: prefs,
            }
        },
        components: {
            PrimaryBind,
            CompoundBind,
        },
        methods: {
            queryShortcuts() {
                let primaryShortcuts = _.cloneDeep(this.$background.primaryShortcuts);

                // Due to Javascript object reference, we need to pick by a new shortcuts Object,
                // otherwise can't trigger a props value change.
                this.shortcuts = _.pickBy(primaryShortcuts, (value, key) => {
                    return key.length === 1;
                });
                this.compoundShortcuts = _.pickBy(primaryShortcuts, (value, key) => {
                    return key.length === 2;
                });
            },
        },
        created: function() {
            this.queryShortcuts();
        },
    }
</script>