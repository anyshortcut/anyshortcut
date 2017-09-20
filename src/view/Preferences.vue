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

        <div class="preference-divider"></div>

        <a href="tour.html" target="_blank"
           class="preference-item-link">
            <div class="preference-item flex-horizontal">
                Tour
            </div>
        </a>

        <div class="preference-divider"></div>

        <a href="https://chrome.google.com/webstore/detail/anyshortcut/ginilcdjefkbpeelgekodpmmabppcfao/reviews"
           target="_blank"
           class="preference-item-link">
            <div class="preference-item flex-horizontal">
                Rate us!
            </div>
        </a>

        <div class="preference-divider"></div>
        <div class="preference-item flex-horizontal">
            Follow us:
            <div>
            <span class="social-icon">
                <a href="https://twitter.com/anyshortcut" target="_blank" title="@anyshortcut">
                        <img src="../img/twitter.svg" alt="">
                </a>
            </span>
                <span class="social-icon">
                <a href="https://telegram.me/anyshortcut" target="_blank" title="https://t.me/anyshortcut">
                    <img src="../img/telegram.svg" alt="">
                </a>
            </span>
            </div>
        </div>

        <popover :ref-id="'tooltip-quick-secondary-shortcut'">
            <div style="font-size: 12px;">
                Use SHIFT+ALT+PrimaryKey➯SecondaryKey open secondary shortcut in any page
            </div>
        </popover>

        <popover :ref-id="'tooltip-compound-shortcut'">
            <img src="../img/compound-tips.gif"/>
        </popover>
    </div>
</template>
<style lang="less">
    @import "../less/_common.less";

    .preference-view {
        width: 300px;
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
        padding: 10px 20px;
        font-size: 14px;

        &:hover {
            background: #f8f8f8;
        }

        .social-icon {
            margin: 0 5px;
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

    .preference-item-link {
        color: initial;
    }
</style>
<script type="es6">
    import Popover from "../component/Popover.vue";
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
        components: {
            Popover,
        },
    };
</script>