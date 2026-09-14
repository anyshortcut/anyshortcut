<template>
  <transition :name="transitionName">
    <div class="popper" v-show="showing" @mouseenter="show" @mouseleave="hidden">
      <slot>Popover</slot>
      <img v-if="showArrow" class="popper-arrow" src="../img/triangle.svg" x-arrow />
    </div>
  </transition>
</template>
<style lang="scss">
@import '../scss/_common.scss';

.popper {
  z-index: 999;
}

.popper-arrow {
  position: absolute;
  display: block;
  bottom: -12px;
  margin-top: 0;
  margin-bottom: 0;
  z-index: 1000;
}

.tooltip {
  background: fade_out(#fefefe, 0.1);
  font-size: 12px;
  color: $primary-color;
  padding: 5px;
  border-radius: 3px;
  box-shadow:
    0 0 20px 4px rgba(154, 161, 177, 0.15),
    0 4px 80px -8px rgba(36, 40, 47, 0.25),
    0 4px 4px -2px rgba(91, 94, 105, 0.15);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease-in;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
<script lang="ts">
import { defineComponent } from 'vue';
import Popper from 'popper.js';
import { throttle } from 'lodash-es';

export default defineComponent({
  name: 'Popover',
  data() {
    return {
      popper: null as Popper | null,
      showing: false,
    };
  },
  props: {
    refId: {
      type: String,
    },
    showArrow: {
      type: Boolean,
      default() {
        return true;
      },
    },
    transitionName: {
      type: String,
      default() {
        return 'fade';
      },
    },
  },
  watch: {
    showing: function (newValue: boolean) {
      this.$emit('on-show-change', newValue);
    },
  },
  methods: {
    dismiss: function () {
      // Dismiss popover immediately
      this.showing = false;
    },
    hidden: function () {
      // Dismiss popover with delay
      (this as any)._timeoutId = setTimeout(() => {
        this.showing = false;
      }, 200);
    },
    show: function () {
      this.showing = true;
      clearTimeout((this as any)._timeoutId);
    },
    render: function (target: Element) {
      this.show();
      if (!this.popper) {
        let emptyReference = {} as any;
        this.popper = new Popper(emptyReference, this.$el, {
          placement: 'top',
          modifiers: {
            preventOverflow: {
              // The default boundaries element is 'scrollParent', we should change to 'window'.
              boundariesElement: 'window',
            },
          },
        });
      }

      this.popper.reference = target;
      // Don't use scheduleUpdate() method because of has bad UI shake in Firefox
      // this.popper.scheduleUpdate();
      this.popper.update();
    },
  },
  mounted() {
    let refElement = this.refId ? document.getElementById(this.refId) : null;
    if (refElement) {
      refElement.onmouseenter = throttle(() => {
        this.render(refElement);
      }, 200);

      refElement.onmouseleave = throttle(() => {
        this.hidden();
      }, 200);
    }
  },
});
</script>
