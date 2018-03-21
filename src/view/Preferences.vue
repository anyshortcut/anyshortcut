<template>
    <div class="preference-view">
        <header class="preference-header">
            <a href="#/main"><img src="../img/back.svg" class="back-icon"/></a>
            Setting
        </header>

        <a href="https://anyshortcut.com/account"
           target="_blank"
           class="preference-item-link">
            <div class="preference-item flex-vertical" v-if="$background.subscriptionStatus==='active'">
                <div class="flex-horizontal">
                    Account <span class="subscription-status status-active">subscribing</span>
                </div>
                <div class="preference-subtitle">
                    <span>
                        Your next bill on {{ new Date($background.subscriptionEndAt * 1000).toLocaleDateString() }}
                    </span>
                </div>
            </div>
            <div class="preference-item flex-vertical" v-else-if="$background.subscriptionStatus==='trialing'">
                <div class="flex-horizontal">
                    Account <span class="subscription-status status-trailing">trialing</span>
                </div>
                <div class="preference-subtitle">
                    <span>
                        Your trialing will expired on
                        {{ new Date($background.subscriptionEndAt * 1000).toLocaleDateString() }}
                    </span>
                </div>
            </div>
            <div class="preference-item flex-vertical" v-else>
                <div class="flex-horizontal">
                    Account <span class="subscription-status status-failed">
                    {{ $background.subscriptionStatus.replace('_', ' ') }}</span>
                </div>
                <div class="preference-subtitle">
                    <span>
                        Your subscription was {{ $background.subscriptionStatus.replace('_', ' ') }}.
                    </span>
                </div>
            </div>
        </a>

        <div class="preference-divider"></div>

        <div class="preference-item flex-vertical">
            Customize the combination key:
            <div>
                <input type="radio" id="alt" v-model='combinationKey' :value="'alt'">
                <label for="alt" class="preference-subtitle">
                    <b>ALT</b> + KEY
                    <span data-balloon="The default one"
                          data-balloon-pos="up">
                        <img class="info-img" src="../img/info-grey.svg" alt="info">
                    </span>
                </label>
            </div>
            <div>
                <input type="radio" id="shift" v-model="combinationKey" :value="'shift'">
                <label for="shift" class="preference-subtitle">
                    <b>SHIFT</b> + KEY
                    <span data-balloon="Prefer for Firefox of Windows"
                          data-balloon-pos="up">
                        <img class="info-img" src="../img/info-grey.svg" alt="info">
                    </span>
                </label>
            </div>
        </div>

        <div class="preference-divider"></div>

        <div class="preference-item flex-vertical">
            How to open shortcut:
            <div>
                <input type="radio" id="blank" v-model='openByBlank' :value="true">
                <label for="blank" class="preference-subtitle">in new tab</label>
            </div>
            <div>
                <input type="radio" id="self" v-model="openByBlank" :value="false">
                <label for="self" class="preference-subtitle">in same tab</label>
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
                   v-model='compoundEnable'>
        </div>

        <div class="preference-divider"></div>

        <div class="preference-item flex-vertical">
            Show shortcut circle?
            <div>
                <select v-model="showCircle">
                    <option disabled value="">Please select one</option>
                    <option value="always">always</option>
                    <option value="only">only in secondary shortcut activated pages</option>
                    <option value="never">never</option>
                </select>
            </div>
        </div>

        <div class="preference-divider"></div>

        <a href="tour.html" target="_blank"
           class="preference-item-link">
            <div class="preference-item flex-horizontal">
                Tour
            </div>
        </a>

        <div class="preference-divider"></div>

        <a :href="reviewUrl"
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

        <popover :ref-id="'tooltip-compound-shortcut'">
            <img src="../img/compound-tips.gif"/>
        </popover>
    </div>
</template>
<style lang="scss">
    @import "../scss/_common.scss";

    .preference-view {
        width: 300px;
        background: $content-bgcolor;
    }

    .preference-header {
        @include header;
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
        width: 100%;
    }

    .flex-vertical {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .preference-subtitle {
        font-size: 13px;
        color: #797979;
        margin: 3px 0;
    }

    .preference-divider {
        background-color: #ececec;
        height: 1px;
        margin: 0 10px;
    }

    .preference-item-link {
        color: initial;
    }

    .subscription-status {
        font-size: 12px;
        color: #FFFFFF;
        border-radius: 4px;
        padding: 0 6px;
    }

    .status-trailing {
        background-color: #FAC64B;
    }

    .status-active {
        background-color: #26A85E;
    }

    .status-failed {
        background-color: #FC0D1B;
    }
</style>
<script type="es6">
    import Popover from "../component/Popover.vue";
    import prefs from "../js/prefs.js";

    export default {
        name: 'preference-view',
        data() {
            return {
                combinationKey: prefs.getDefaultCombinationKey(),
                openByBlank: prefs.isShortcutOpenByBlank(),
                compoundEnable: prefs.isCompoundShortcutEnable(),
                showCircle: prefs.getShowCircleConfig(),
                reviewUrl: window.browser ? 'https://addons.mozilla.org/addon/anyshortcut-firefox/'
                    : 'https://chrome.google.com/webstore/detail/anyshortcut/ginilcdjefkbpeelgekodpmmabppcfao/reviews',
            }
        },
        watch: {
            combinationKey: function(newValue) {
                prefs.setDefaultCombinationKey(newValue);
            },
            openByBlank: function(newValue) {
                prefs.setShortcutOpenByBlank(newValue);
            },
            compoundEnable: function(newValue) {
                prefs.setCompoundShortcutEnable(newValue);
            },
            showCircle: function(newValue) {
                prefs.setShowCircleConfig(newValue);
            }
        },
        components: {
            Popover,
        },
    };
</script>