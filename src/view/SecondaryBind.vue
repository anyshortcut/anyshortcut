<template>
  <div class="secondary-bind">
    <div class="primary-title">Specify secondary shortcut for this domain</div>
    <keyboard
      :combination-key="prefs.getDefaultCombinationKey()"
      :bound-keys="boundKeys"
      :show-slide-keys="false"
      :highlight-key="highlightKey"
      @key-hover-over="onHoverOver"
      @key-hover-leave="onHoverLeave"
    >
    </keyboard>

    <popover
      :ref="'popover'"
      :transition-name="null"
      style="width: 280px"
      @on-show-change="onPopoverShowChange"
    >
      <shortcut-board
        :shortcut="hoveredShortcut"
        :parent-key-char="domainShortcut.key"
        :key-char="keyChar"
      >
      </shortcut-board>
    </popover>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Keyboard from '../component/Keyboard.vue';
import KeyboardBind from './mixin-keyboard-bind';
import prefs from '../prefs';
import type { Shortcut } from '../types';

export default defineComponent({
  name: 'SecondaryBind',
  data() {
    return {
      prefs: prefs,
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
    Keyboard,
  },
  mixins: [KeyboardBind],
});
</script>

<style scoped>
.secondary-bind {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 300px;
}
</style>
