import { createApp } from 'vue';
import { RouterView } from 'vue-router';
import router from './router.js';
import Toast from '../component/toast.js';
import Bus from '../libs/vue-bus.js';
import config from '../config.js';

import Raven from 'raven-js';

if (!config.debug) {
  Raven.config('https://0aa6274679824a129c33c2cc4ae0d22b@sentry.io/144189').install();
}

const $background = chrome.extension.getBackgroundPage();

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.auth)) {
    if ($background.authenticated) {
      next();
    } else {
      next({
        path: '/welcome',
        query: {
          redirect: to.fullPath,
        },
      });
    }
  } else {
    next();
  }
});

const app = createApp(RouterView);

app.config.globalProperties.$toast = Toast;
app.config.globalProperties.$background = $background;
app.use(router);
app.use(Bus);

app.mount('#vue');
