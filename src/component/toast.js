import { createApp } from 'vue';
import ToastComponent from './Toast.vue';

let instances = [];
let seed = 1;

let Toast = function (options) {
  options = options || {};
  if (typeof options === 'string') {
    options = {
      message: options,
    };
  }
  let userOnClose = options.onClose;
  let id = 'toast_' + seed++;

  options.onClose = function () {
    Toast.close(id, userOnClose);
  };

  const app = createApp(ToastComponent, options);
  const instance = app.mount(document.createElement('div'));

  instance.id = id;
  document.body.appendChild(instance.$el);
  instance.visible = true;
  instance.$el.style.zIndex = 10000;
  instances.push({ instance, app, id });
  return instance;
};

['success', 'warning', 'info', 'error'].forEach((type) => {
  Toast[type] = (options) => {
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
