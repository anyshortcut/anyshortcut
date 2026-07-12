import { createApp } from 'vue';
import Tour from './Tour.vue';
import $background from '../extension-api.js';
// The tour page demos the in-page shortcut UI, so it needs both stylesheets.
import '../scss/tour.scss';
import '../scss/content-script.scss';

$background.init().then(() => {
  createApp(Tour).mount('#app');
});
