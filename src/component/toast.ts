import { createApp } from 'vue';
import type { App, ComponentPublicInstance } from 'vue';
import ToastComponent from './Toast.vue';

export interface ToastOptions {
  message?: string;
  type?: 'success' | 'warning' | 'info' | 'error';
  duration?: number;
  onClose?: (instance: ToastInstance) => void;
}

type ToastInstance = ComponentPublicInstance & {
  id: string;
  visible: boolean;
};

export interface ToastFunction {
  (options: ToastOptions | string): ToastInstance;
  success(options: ToastOptions | string): ToastInstance;
  warning(options: ToastOptions | string): ToastInstance;
  info(options: ToastOptions | string): ToastInstance;
  error(options: ToastOptions | string): ToastInstance;
  close(id: string, userOnClose?: (instance: ToastInstance) => void): void;
}

const instances: { instance: ToastInstance; app: App; id: string }[] = [];
let seed = 1;

const Toast = function (options: ToastOptions | string): ToastInstance {
  if (typeof options === 'string') {
    options = {
      message: options,
    };
  }
  const userOnClose = options.onClose;
  const id = 'toast_' + seed++;

  options.onClose = function () {
    Toast.close(id, userOnClose);
  };

  const app = createApp(ToastComponent, options as Record<string, unknown>);
  const instance = app.mount(document.createElement('div')) as ToastInstance;

  instance.id = id;
  document.body.appendChild(instance.$el);
  instance.visible = true;
  instance.$el.style.zIndex = 10000;
  instances.push({ instance, app, id });
  return instance;
} as ToastFunction;

(['success', 'warning', 'info', 'error'] as const).forEach((type) => {
  Toast[type] = (options: ToastOptions | string) => {
    if (typeof options === 'string') {
      options = {
        message: options,
      };
    }
    options.type = type;
    return Toast(options);
  };
});

Toast.close = function (id, userOnClose) {
  for (let i = 0, len = instances.length; i < len; i++) {
    if (id === instances[i].id) {
      if (typeof userOnClose === 'function') {
        userOnClose(instances[i].instance);
      }
      instances[i].app.unmount();
      instances.splice(i, 1);
      break;
    }
  }
};

export default Toast;
