import mitt from 'mitt';

const emitter = mitt();

export default {
  install(app) {
    app.config.globalProperties.$bus = emitter;
  },
};
