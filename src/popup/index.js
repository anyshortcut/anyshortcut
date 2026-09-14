import { createApp } from 'vue';
import { RouterView } from 'vue-router';
import router from './router.js';
import Toast from '../component/toast.js';
import Bus from '../libs/vue-bus.js';
import $background from '../extension-api.js';

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
