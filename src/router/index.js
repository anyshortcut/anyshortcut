import Vue from "vue";
import VueRouter from 'vue-router';
import Welcome from '@/router/Welcome.vue';
import Main from '@/router/Main.vue';
import Preferences from '@/router/Preferences.vue';

Vue.use(VueRouter);

export default new VueRouter({
    routes: [
        {
            name: 'welcome',
            path: '/welcome',
            component: Welcome,
            meta: {
                auth: false,
            }
        },
        {
            name: 'preference',
            path: '/preference',
            component: Preferences,
            meta: {
                auth: true,
            }
        },
        {
            name: 'main',
            path: '/',
            component: Main,
            meta: {
                auth: true,
            }
        },
    ],
});
