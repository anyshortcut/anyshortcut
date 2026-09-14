import { createApp } from 'vue';
import Tour from './Tour.vue';
import $background from '../extension-api';
// The tour page demos the in-page shortcut UI, so it needs both stylesheets.
import '../scss/tour.scss';
import '../scss/content-script.scss';
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
