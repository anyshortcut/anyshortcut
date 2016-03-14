import Vue from 'vue';
import Router from 'vue-router';

import App from './component/App.vue';
import BoundsView from './component/BoundsView.vue';
import SettingsView from './component/SettingsView.vue';
import AboutView from './component/About.vue';

import OriginalShortcutView from './component/OriginShortcut.vue';
import OptionShortcutView from './component/OptionShortcut.vue';


Vue.use(Router);

var router = new Router();

router.map({
    '/bounds': {
        component: BoundsView,
        subRoutes: {
            '/origin': {
                component: OriginalShortcutView
            },
            '/option': {
                component: OptionShortcutView
            }
        }
    },
    '/settings': {
        component: SettingsView
    },
    '/about': {
        component: AboutView
    }
});

router.start(App, '#app');