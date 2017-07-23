<template>
    <div class="preference-view">
        <header class="preference-header">
            <a href="#/main"><img src="../img/back.svg" class="back-icon"/></a>
            Setting
        </header>

        <div class="preference-item flex-vertical">
            Open primary shortcut:
            <div>
                <input type="radio" id="p-blank" v-model='preference.primary_blank' :value="true">
                <label for="p-blank" class="preference-subtitle">in new tab</label>
            </div>
            <div>
                <input type="radio" id="p-self" v-model="preference.primary_blank" :value="false">
                <label for="p-self" class="preference-subtitle">in same tab</label>
            </div>
        </div>
        <div class="preference-divider"></div>
        <div class="preference-item flex-vertical">
            Open secondary shortcut:
            <div>
                <input type="radio" id="s-blank" v-model="preference.secondary_blank" :value="true">
                <label for="s-blank" class="preference-subtitle">in new tab</label>
            </div>
            <div>
                <input type="radio" id="s-self" v-model="preference.secondary_blank" :value="false">
                <label for="s-self" class="preference-subtitle">in same tab</label>
            </div>
        </div>

        <div class="preference-divider"></div>

        <div class="preference-item flex-vertical">
            <span>Quick open secondary shortcut:
                <img id="tooltip-quick-secondary-shortcut" class="info-img" src="../img/info-grey.svg" alt="info">
            </span>
            <div>
                <input type="radio" id="qs-blank" v-model="preference.quick_secondary_blank" :value="true">
                <label for="qs-blank" class="preference-subtitle">in new tab</label>
            </div>
            <div>
                <input type="radio" id="qs-self" v-model="preference.quick_secondary_blank" :value="false">
                <label for="qs-self" class="preference-subtitle">in same tab</label>
            </div>
        </div>

        <div class="preference-divider"></div>

        <div class="preference-item flex-horizontal">
            <label for="enable-compound-shortcut"> Enable compound shortcut
                <span>
                        <img id="tooltip-compound-shortcut" class="info-img" src="../img/info-grey.svg" alt="info">
                    </span>
            </label>
            <input id="enable-compound-shortcut" type="checkbox"
                   v-model='preference.compound_shortcut_enable'>
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

    .preference-item {
        padding: 8px 15px;
        font-size: 14px;

        &:hover {
            background: #f8f8f8;
        }
    }

    .flex-horizontal {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .flex-vertical {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .preference-subtitle {
        font-size: 13px;
        color: #797979;
    }

    .preference-divider {
        background-color: #ececec;
        height: 1px;
        margin: 0 10px;
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
            new Tooltip(document.getElementById("tooltip-quick-secondary-shortcut"), {
                placement: "top",
                title: "Use SHIFT+ALT+PrimaryKey➯SecondaryKey open secondary shortcut in any page",
            });

            new Tooltip(document.getElementById("tooltip-compound-shortcut"), {
                placement: "top",
                title: "Compound shortcut mean two letter primary shortcut",
            });
        }
    };
</script>