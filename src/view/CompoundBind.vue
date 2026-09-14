<template>
  <div class="compound-bind-view">
    <div>
      <span class="primary-title"> Specify compound shortcut </span>
      <span
        data-balloon="Enter the keys you want to bind can scroll the table automatically.
             You needn't scroll your mouse to achieve this."
        data-balloon-length="large"
        data-balloon-pos="down"
      >
        <img
          id="tooltip-compound-shortcut-filter"
          class="info-img"
          src="../img/info-grey.svg"
          alt="info"
        />
      </span>
    </div>

    <compound-keyboard
      :bound-keys="boundKeys"
      :highlight-key="highlightKey"
      @on-table-scroll="onTableScroll"
      @key-hover-over="onHoverOver"
      @key-hover-leave="onHoverLeave"
    >
    </compound-keyboard>

    <popover
      :ref="'popover'"
      :transition-name="null"
      style="width: 50%"
      @on-show-change="onPopoverShowChange"
    >
      <shortcut-board :shortcut="hoveredShortcut" :key-char="keyChar"> </shortcut-board>
    </popover>
  </div>
</template>
<style>
.compound-bind-view {
  width: 560px;
  display: flex;
  flex-direction: column;
  background: var(--content-bgcolor);
}
</style>
<script lang="ts">
import { defineComponent } from 'vue';
import CompoundKeyboard from '../component/CompoundKeyboard.vue';
import KeyboardBind from './mixin-keyboard-bind';

export default defineComponent({
  name: 'CompoundBindView',
  components: {
    CompoundKeyboard,
  },
  mixins: [KeyboardBind],
});
</script>
