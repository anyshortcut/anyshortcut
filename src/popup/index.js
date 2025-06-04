import { createApp } from 'vue';
import { RouterView } from 'vue-router';
import router from './router.js';
import Toast from '../component/toast.js';
import Bus from '../libs/vue-bus.js';

const $background = chrome.extension.getBackgroundPage();

const app = createApp(RouterView);

app.config.globalProperties.$toast = Toast;
app.config.globalProperties.$background = $background;
app.use(router);
app.use(Bus);

app.mount('#vue');
