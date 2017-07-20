<template>
    <div class="preference-view">
        <header class="preference-header">
            <a href="#/main"><img src="../img/back.svg" class="back-icon"/></a>
            Setting
        </header>

        <div class="preference-group">
            <div class="preference-title">
                Open shortcut in new tab
                <span>
                <img id="tooltip-shortcut-open" class="info-img" src="../img/info-grey.svg" alt="info">
                </span>
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
        <div class="preference-divider"></div>
        <div class="preference-group">
            <div class="preference-item">
                <label for="enable-compound-shortcut"> Enable compound shortcut
                    <span>
                        <img id="tooltip-compound-shortcut" class="info-img" src="../img/info-grey.svg" alt="info">
                    </span>
                </label>
                <input id="enable-compound-shortcut" type="checkbox"
                       v-model='preference.compound_shortcut_enable'>
            </div>
        </div>
    </div>
</template>
<style lang="less">
    @import "../less/_common.less";

    .preference-view {
        width: 350px;
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

        .preference-title {
            font-size: 16px;
            line-height: 1.5;
            color: @secondary-color;
            padding: 15px 15px 0;
        }

        .preference-item {
            display: flex;
            align-items: center;
            position: relative;
            width: 100%;
            padding: 8px 15px;
            font-size: 14px;
            justify-content: space-between;

            &:hover {
                background: #f8f8f8;
            }
        }
    }

    .preference-divider {
        background-color: @header-bgcolor;
        height: 15px;
        border-top: solid #eeeeee 1px;
        border-bottom: solid #eeeeee 1px;
    }

    @tooltip-background-color: rgba(23, 23, 23, .7);
    .tooltip {
        padding: 5px 10px;
        background-color: @tooltip-background-color;
        color: white;
        font-size: 12px;
        border-radius: 3px;

        .tooltip-arrow {
            position: absolute;
            display: block;
            width: 0;
            height: 0;
            border-width: 5px;
            border-style: solid dashed dashed dashed;
            border-color: @tooltip-background-color transparent transparent transparent;
            bottom: -10px;
            left: calc(50% - 5px);
            margin-top: 0;
            margin-bottom: 0;
        }
    }
</style>
<script type="es6">
    import Tooltip from "tooltip.js";
    import prefs from "../js/prefs.js";

    export default {
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
        mounted() {
            new Tooltip(document.getElementById("tooltip-shortcut-open"), {
                placement: "top",
                title: "Open in the same tab is default",
            });
            new Tooltip(document.getElementById("tooltip-compound-shortcut"), {
                placement: "top",
                title: "Compound shortcut mean two letter primary shortcut",
            });
        }
    };
</script>