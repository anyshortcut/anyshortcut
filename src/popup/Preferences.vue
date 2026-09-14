<template>
  <div class="preference-view">
    <header class="preference-header">
      <router-link :to="{ name: 'main' }">
        <img src="../img/back.svg" class="back-icon" />
      </router-link>
      Setting
    </header>

    <div class="preference-item flex-vertical">
      Where your shortcuts live:
      <div>
        <input type="radio" id="mode-local" v-model="mode" :value="'local'" />
        <label for="mode-local" class="preference-subtitle">
          <b>This browser</b> — nothing leaves your device
        </label>
      </div>
      <div>
        <input type="radio" id="mode-cloud" v-model="mode" :value="'cloud'" />
        <label for="mode-cloud" class="preference-subtitle">
          <b>Anyshortcut account</b> — synced across your browsers
        </label>
      </div>
      <div class="preference-subtitle">
        Each mode keeps its own shortcuts, so you can switch back at any time.
      </div>

      <div v-if="mode === 'cloud'" class="flex-horizontal" style="margin-top: 8px">
        <span v-if="!$background.authenticated">Not signed in</span>
        <span v-else>{{ $background.user?.email || 'Signed in' }}</span>
        <span
          v-if="$background.authenticated"
          class="subscription-status"
          :class="subscriptionClass"
        >
          {{ $background.subscriptionStatus }}
        </span>
        <a v-else :href="$background.signInUrl" target="_blank" class="preference-subtitle">
          Sign in
        </a>
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
<style>
.preference-view {
  width: 300px;
  background: var(--content-bgcolor);
}

.preference-header {
  background: var(--header-bgcolor);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
  border-bottom: #eeeeee solid 1.3px;
  z-index: 1;
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

  & .social-icon {
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
import type { BackendMode } from '../types';

export default defineComponent({
  name: 'preference-view',
  data() {
    return {
      mode: this.$background.getMode(),
      switching: false,
      combinationKey: prefs.getDefaultCombinationKey(),
      openByBlank: prefs.isShortcutOpenByBlank(),
      compoundEnable: prefs.isCompoundShortcutEnable(),
      showCircle: prefs.getShowCircleConfig(),
    };
  },
  computed: {
    subscriptionClass(): string {
      const status = this.$background.subscriptionStatus;
      if (status === 'active') return 'status-active';
      return status === 'trialing' ? 'status-trailing' : 'status-failed';
    },
  },
  watch: {
    mode: function (newValue: BackendMode) {
      // Reloads the account and the shortcuts for the newly selected source;
      // going back to the main view then renders whatever it found.
      this.switching = true;
      this.$background
        .setMode(newValue)
        .catch((error: Error) => this.$toast.error(error.message))
        .finally(() => {
          this.switching = false;
        });
    },
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
