import { createApp } from 'vue';
import Tour from './Tour.vue';
import $background from '../extension-api';
import '../css/theme.css';
import '../css/common.css';
// The tour page demos the in-page shortcut UI, so it needs both stylesheets.
import '../css/tour.css';
import '../css/content-script.css';
import 'balloon-css';

$background
  .init()
  .then(() => {
    createApp(Tour).mount('#app');
  })
  .catch((error) => {
    // Mounting is skipped on failure, so say why instead of showing a blank page.
    console.error('Failed to initialize Anyshortcut:', error);
    document.getElementById('app').textContent = 'Anyshortcut failed to load. Please reload.';
  });
