import Vue from 'vue';
import Router from 'vue-router';

import App from './component/App.vue';
import BoundsView from './component/BoundsView.vue';
import SettingsView from './component/SettingsView.vue';


Vue.use(Router);

var router = new Router();

router.map({
    //'/': {
    //    template:'Options'
    //},
    '/bounds': {
        component: BoundsView
    },
    '/settings': {
        component: SettingsView
    }
});

router.start(App, '#app');