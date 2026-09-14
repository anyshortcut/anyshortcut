<template>
  <div class="preference-view">
    <header class="preference-header">
      <router-link :to="{ name: 'main' }">
        <img src="../img/back.svg" class="back-icon" />
      </router-link>
      Setting
    </header>

    <div class="preference-item flex-vertical">
      <div class="flex-horizontal">
        Storage <span class="subscription-status status-active">local</span>
      </div>
      <div class="preference-subtitle">
        <span> Your shortcuts are stored locally in your browser </span>
      </div>
    </div>

    <div class="preference-divider"></div>

    <div class="preference-item flex-vertical">
      Customize the combination key:
      <div>
        <input type="radio" id="alt" v-model="combinationKey" :value="'alt'" />
        <label for="alt" class="preference-subtitle">
          <b>ALT</b> + KEY
          <span data-balloon="The default one" data-balloon-pos="up">
            <img class="info-img" src="../img/info-grey.svg" alt="info" />
          </span>
        </label>
      </div>
      <div>
        <input type="radio" id="shift" v-model="combinationKey" :value="'shift'" />
        <label for="shift" class="preference-subtitle"> <b>SHIFT</b> + KEY </label>
      </div>
    </div>

    <div class="preference-divider"></div>

    <div class="preference-item flex-vertical">
      How to open shortcut:
      <div>
        <input type="radio" id="blank" v-model="openByBlank" :value="true" />
        <label for="blank" class="preference-subtitle">in new tab</label>
      </div>
      <div>
        <input type="radio" id="self" v-model="openByBlank" :value="false" />
        <label for="self" class="preference-subtitle">in same tab</label>
      </div>
    </div>

    <div class="preference-divider"></div>

    <div class="preference-item flex-vertical">
      <div>
        <label for="enable-compound-shortcut"> Enable compound shortcut </label>
        <input id="enable-compound-shortcut" type="checkbox" v-model="compoundEnable" />
      </div>
      <div class="preference-subtitle">
        A type of primary shortcut but supports two alphanumeric keys.
      </div>
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

    <a href="tour.html" target="_blank" class="preference-item-link">
      <div class="preference-item flex-horizontal">Tutorial</div>
    </a>
  </div>
</template>
<style lang="scss">
@import '../scss/common';

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

    & img {
      vertical-align: middle;
    }
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
  text-align: left;
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
  color: #ffffff;
  border-radius: 4px;
  padding: 0 6px;
}

.status-trailing {
  background-color: #fac64b;
}

.status-active {
  background-color: #26a85e;
}

.status-failed {
  background-color: #fc0d1b;
}
</style>
<script lang="ts">
import { defineComponent } from 'vue';
import prefs from '../prefs';
import type { CombinationKey, ShowCircleConfig } from '../prefs';

export default defineComponent({
  name: 'preference-view',
  data() {
    return {
      combinationKey: prefs.getDefaultCombinationKey(),
      openByBlank: prefs.isShortcutOpenByBlank(),
      compoundEnable: prefs.isCompoundShortcutEnable(),
      showCircle: prefs.getShowCircleConfig(),
    };
  },
  watch: {
    combinationKey: function (newValue: CombinationKey) {
      prefs.setDefaultCombinationKey(newValue);
    },
    openByBlank: function (newValue: boolean) {
      prefs.setShortcutOpenByBlank(newValue);
    },
    compoundEnable: function (newValue: boolean) {
      prefs.setCompoundShortcutEnable(newValue);
    },
    showCircle: function (newValue: ShowCircleConfig) {
      prefs.setShowCircleConfig(newValue);
    },
  },
});
</script>
