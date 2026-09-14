<template>
  <div class="shortcut-view">
    <div class="shortcut-detail-container">
      <div class="left">
        <primary-shortcut-card :shortcut="domainShortcut"> </primary-shortcut-card>
      </div>
      <div class="right">
        <secondary-shortcut-card
          v-if="currentSecondaryShortcut"
          style="position: absolute; z-index: 9"
          :shortcut="currentSecondaryShortcut"
          @close="currentSecondaryShortcut = null"
        >
        </secondary-shortcut-card>
        <shortcut-list
          :shortcuts="secondaryShortcuts"
          @shortcut-key-click="onShortcutListItemClick"
        >
        </shortcut-list>
      </div>
    </div>

    <popover :ref-id="'keyboard-icon-left'" :show-arrow="false">
      <bind-view class="popup-keyboard"></bind-view>
    </popover>
    <img
      id="keyboard-icon-left"
      class="keyboard-icon-left"
      src="../img/keyboard-icon.svg"
      alt="keyboard-icon"
    />

    <popover :ref-id="'keyboard-icon-right'" :show-arrow="false" :ref="'secondary'">
      <secondary-bind
        class="popup-keyboard"
        :domain-shortcut="domainShortcut"
        :shortcuts="secondaryShortcuts"
      >
      </secondary-bind>
    </popover>
    <img
      id="keyboard-icon-right"
      class="keyboard-icon-right"
      src="../img/keyboard-icon.svg"
      alt="keyboard-icon"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ShortcutList from '../component/ShortcutList.vue';
import Popover from '../component/Popover.vue';
import PrimaryShortcutCard from './PrimaryShortcutCard.vue';
import SecondaryShortcutCard from './SecondaryShortcutCard.vue';
import SecondaryBind from '../view/SecondaryBind.vue';
import BindView from '../view/BindView.vue';
import common from '../common';
import { cloneDeep, forOwn } from 'lodash-es';
import type { DomainShortcuts, Shortcut } from '../types';

export default defineComponent({
  name: 'ShortcutView',
  data() {
    return {
      currentSecondaryShortcut: null as Shortcut | null,
      secondaryShortcuts: {} as DomainShortcuts,
    };
  },
  props: {
    domainShortcut: {
      type: Object as () => Shortcut,
      default() {
        return {};
      },
    },
  },
  components: {
    ShortcutList,
    Popover,
    SecondaryBind,
    BindView,
    PrimaryShortcutCard,
    SecondaryShortcutCard,
  },
  methods: {
    queryShortcuts() {
      this.currentSecondaryShortcut = null;

      let activeTab = this.$background.activeTab;
      this.secondaryShortcuts = cloneDeep(
        this.$background.getSecondaryShortcutsByUrl(activeTab.url)
      );

      // Add 'parentKey' property for all domain secondary shortcuts.
      // Iterate both secondary shortcuts to find the current secondary shortcut,
      forOwn(this.secondaryShortcuts, (shortcut) => {
        shortcut['parentKey'] = this.domainShortcut.key;

        if (common.isUrlEquivalent(shortcut.url, activeTab.url)) {
          this.currentSecondaryShortcut = cloneDeep(shortcut);
        }
      });
      return Promise.resolve();
    },
    onShortcutListItemClick(shortcut: Shortcut) {
      this.currentSecondaryShortcut = shortcut;
    },
  },
  mounted() {
    this.queryShortcuts();
    this.$bus.on('refresh', this.queryShortcuts);

    // setTimeout(() => {
    //     if (!this.isDomainShortcutPinned && !this.currentSecondaryShortcut) {
    //         this.$refs.secondary.render(document.getElementById('keyboard-icon-right'));
    //     }
    // }, 200);
  },
  unmounted() {
    this.$bus.off('refresh', this.queryShortcuts);
  },
});
</script>

<style lang="scss" scoped>
@import '../scss/_common.scss';

.shortcut-view {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  transition: opacity 0.2s ease-in;
}

.shortcut-detail-container {
  position: relative;
  width: 800px;
  height: 500px;
  margin: auto;
  overflow: hidden;
}

.left {
  position: relative;
  width: 50%;
  height: 100%;
  float: left;
  background-color: #ffffff;
}

.right {
  background-color: #ffffff;
  width: 50%;
  height: 100%;
  float: left;

  & > ul {
    padding-bottom: 50px;
    overflow-x: hidden;
    overflow-y: auto;
    height: 100%;
  }
}

.popup-keyboard {
  width: 560px;
  box-sizing: content-box;
  background-color: #ffffff;
  border-top: #6badf2 solid 5px;
  border-radius: 5px 5px 0 0;
  box-shadow: 0 5px 21px 0 rgba(128, 128, 128, 0.2);
  z-index: 999;
}

@mixin keyboard-icon {
  position: absolute;
  bottom: 0;
  width: 30px;
  height: 30px;
  z-index: 99;
  cursor: pointer;
}

.keyboard-icon-right {
  @include keyboard-icon;
  right: 5px;

  &:hover {
    content: url('../img/keyboard-icon-blue.svg');
  }
}

.keyboard-icon-left {
  @include keyboard-icon;
  left: 5px;

  &:hover {
    content: url('../img/keyboard-icon-white.svg');
  }
}
</style>
