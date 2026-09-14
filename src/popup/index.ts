import { createApp } from 'vue';
import { RouterView } from 'vue-router';
import router from './router';
import Toast from '../component/toast';
import Bus from '../libs/vue-bus';
import $background from '../extension-api';
// Icon fonts and tooltip css, bundled from npm instead of CDN links.
import 'font-awesome/css/font-awesome.css';
import 'simple-line-icons/css/simple-line-icons.css';
import 'balloon-css';

const app = createApp(RouterView);

app.config.globalProperties.$toast = Toast;
app.config.globalProperties.$background = $background;
app.use(router);
app.use(Bus);

// Load active tab, platform and shortcuts before mounting so components
// can keep reading $background synchronously, like the MV2 background page.
$background
  .init()
  .then(() => {
    app.mount('#vue');
  })
  .catch((error) => {
    // Mounting is skipped on failure, so say why instead of showing a blank popup.
    console.error('Failed to initialize Anyshortcut:', error);
    document.getElementById('vue').textContent =
      'Anyshortcut failed to load. Please reopen the popup.';
  });
