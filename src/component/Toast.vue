<template>
  <transition name="toast-fade" @after-leave="destroyElement">
    <div class="toast" v-show="visible" @mouseenter="clearTimer" @mouseleave="startTimer">
      <img class="toast-img" :src="typeImg" alt="" />
      <div class="toast-group">
        <p>{{ message }}</p>
        <div class="toast-close-button" @click="close">X</div>
      </div>
    </div>
  </transition>
</template>
<style>
.toast {
  box-shadow: var(--box-shadow-base);
  min-width: 300px;
  padding: 10px 12px;
  box-sizing: border-box;
  border-radius: 2px;
  position: fixed;
  left: 50%;
  top: 1px;
  transform: translateX(-50%);
  background-color: #ffffff;
  transition:
    opacity 0.3s,
    transform 0.4s;
  overflow: hidden;

  & .toast-group {
    margin-left: 38px;
    position: relative;
    height: 20px;
    line-height: 20px;
    display: flex;
    align-items: center;

    & p {
      font-size: 14px;
      margin: 0 34px 0 0;
      white-space: nowrap;
      color: black;
      text-align: justify;
    }
  }
  & .toast-img {
    size: 40px;
    position: absolute;
    left: 0;
    top: 0;
  }
  & .toast-close-button {
    position: absolute;
    right: 3px;
    cursor: pointer;
    color: silver;
    font-size: 14px;

    &:hover {
      color: grey;
    }
  }
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -100%);
}
</style>
<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import successImg from '../img/success.svg';
import infoImg from '../img/info.svg';
import errorImg from '../img/error.svg';
import warningImg from '../img/exclamation.svg';

const TYPE_IMAGES: Record<string, string> = {
  success: successImg,
  info: infoImg,
  error: errorImg,
  warning: warningImg,
};

export default defineComponent({
  name: 'ToastMessage',
  props: {
    message: { type: String, default: '' },
    type: { type: String, default: 'info' },
    duration: { type: Number, default: 2000 },
    onClose: { type: Function as PropType<(instance: unknown) => void>, default: null },
  },
  data() {
    return {
      visible: false,
      timer: null as ReturnType<typeof setTimeout> | null,
      closed: false,
    };
  },
  computed: {
    typeImg(): string {
      return TYPE_IMAGES[this.type] || TYPE_IMAGES.info;
    },
  },
  methods: {
    close() {
      this.closed = true;
      this.visible = false;
    },
    destroyElement() {
      // Unmounting and DOM removal happen in toast.ts (Toast.close → app.unmount()).
      if (typeof this.onClose === 'function') {
        this.onClose(this);
      }
    },
    clearTimer() {
      if (this.timer) {
        clearTimeout(this.timer);
      }
    },
    startTimer() {
      if (this.duration > 0) {
        this.timer = setTimeout(() => {
          if (!this.closed) {
            this.close();
          }
        }, this.duration);
      }
    },
  },
  mounted() {
    this.startTimer();
  },
});
</script>
