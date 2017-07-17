<template>
    <div class="preference-view">
        <header class="preference-header">
            <a href="#/main"><img src="../img/back.svg" class="back-icon"/></a>
            Setting
        </header>

        <div class="preference-group">
            <div class="preference-title">
                Open shortcut in new tab
                <div class="preference-title-help">* Open in the same tab is default</div>
            </div>

            <div class="preference-item">
                <label for="primary-blank">Primary shortcut</label>
                <input id="primary-blank" type="checkbox"
                       v-model='preference.primary_blank'>
            </div>
            <div class="preference-item">
                <label for="secondary-blank">Secondary shortcut</label>
                <input id="secondary-blank" type="checkbox"
                       v-model='preference.secondary_blank'>
            </div>
            <div class="preference-item">
                <label for="quick-secondary-blank">Quick secondary shortcut</label>
                <input id="quick-secondary-blank" type="checkbox"
                       v-model='preference.quick_secondary_blank'>
            </div>
        </div>
    </div>
</template>
<style lang="less">
    @import "../less/_common.less";

    .preference-view {
        line-height: 2em;
        width: 400px;
        height: 450px;
        background: @content-bgcolor;
    }

    .preference-header {
        .header;
        justify-content: flex-start;
    }

    .back-icon {
        padding: 5px 10px;
        vertical-align: middle;
    }

    .preference-group {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 5px 0;
        margin: 10px 0;

        border-top: solid #DDDDDD 1px;
        border-bottom: solid #DDDDDD 1px;
        background-color: #fbfbfb;

        .preference-title {
            font-size: 18px;
            font-weight: 500;
            color: @secondary-color;
            line-height: 1.5;
            padding: 0 15px;
        }

        .preference-title-help {
            font-size: 12px;
            color: #999999;
            text-align: start;
        }
        .preference-item {
            display: flex;
            align-items: center;
            position: relative;
            width: 100%;
            padding: 0 10px;
            border-bottom: solid #f8f8f8 1px;
            justify-content: space-between;
        }
    }
</style>
<script type="es6">
    import prefs from "../js/prefs.js";
    export default{
        name: 'preference-view',
        data() {
            return {
                preference: prefs.localPreference()
            }
        },
        watch: {
            preference: {
                // use deep property to watch nested property changed.
                deep: true,
                handler: function(newValue) {
                    prefs.update(newValue);
                }
            }
        },
    };
</script>