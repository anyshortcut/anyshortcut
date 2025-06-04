import { createApp } from 'vue';
import Tour from './Tour.vue';
import Raven from 'raven-js';

Raven.config('https://0aa6274679824a129c33c2cc4ae0d22b@sentry.io/144189').install();

createApp(Tour).mount('#app');
