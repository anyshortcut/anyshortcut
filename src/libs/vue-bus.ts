import mitt from 'mitt';
import type { Emitter } from 'mitt';
import type { App } from 'vue';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Bus = Emitter<Record<string, any>>;

const emitter: Bus = mitt();

export default {
  install(app: App) {
    app.config.globalProperties.$bus = emitter;
  },
};
