import { createRouter, createWebHashHistory } from 'vue-router';
import Welcome from './Welcome.vue';
import Main from './Main.vue';
import Preferences from './Preferences.vue';

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      name: 'welcome',
      path: '/welcome',
      component: Welcome,
    },
    {
      name: 'preference',
      path: '/preference',
      component: Preferences,
    },
    {
      name: 'main',
      path: '/',
      component: Main,
    },
  ],
});
