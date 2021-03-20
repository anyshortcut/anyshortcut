<template>
    <div class="bind-view" :style="{height:height}">
        <primary-bind :shortcuts="shortcuts"
                      v-if="bindType==='primary'">
        </primary-bind>
        <compound-bind v-else-if="bindType==='compound'"
                       :shortcuts="compoundShortcuts">
        </compound-bind>
        <div class="bind-nav-bar" v-if="prefs.isCompoundShortcutEnable()">
            <div :class="{active:bindType==='primary'}"
                 @click="bindType='primary'">
                Primary shortcut
            </div>
            <div :class="{active:bindType==='compound'}"
                 @click="bindType='compound'">
                Compound shortcut
            </div>
        </div>
    </div>
</template>
<style lang="scss">
    .bind-view {
        width: 560px;
        position: relative;
    }

    .bind-nav-bar {
        position: absolute;
        left: 0;
        bottom: 0;
        right: 0;
        height: 35px;
        display: flex;
        justify-content: space-around;

        & div {
            cursor: pointer;
            user-select: none;
            color: #666666;
            text-align: center;
            border-top: 1px solid #dbdbdb;
            background-color: #fefefe;
            flex: 1;
            line-height: 35px;
        }

        & .active {
            background-color: #ffffff;
            color: #427DDB;
            border: #DBDBDB solid 1px;
            border-top: none;
            border-radius: 2px;
        }
    }
</style>
<script type="es6">
    import PrimaryBind from "../view/PrimaryBind.vue";
    import CompoundBind from "../view/CompoundBind.vue";
    import prefs from "../prefs.js";
    import _ from "lodash";

    export default {
        name: 'BindView',
        data() {
            return {
                bindType: 'primary',
                shortcuts: null,
                compoundShortcuts: null,
                prefs: prefs,
            }
        },
        computed: {
            height: function() {
                return (this.prefs.isCompoundShortcutEnable() ? 350 : 300) + 'px';
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
        mounted() {
            this.$bus.on('refresh', this.queryShortcuts)
        }
    }
</script>