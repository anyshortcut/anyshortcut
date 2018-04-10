require('./libs/vue-filters.js');
require('./libs/vue-filters.js');

import Vue from "vue";
import VueRouter from 'vue-router';
import ga from "./mixin-ga.js";
import router from "@/router";
import Toast from "../component/toast.js";
import Bus from "./libs/vue-bus.js";
import config from "./config.js";

import Raven from "raven-js";
import RavenVue from 'raven-js/plugins/vue';

if (!config.debug) {
    Raven.config('https://0aa6274679824a129c33c2cc4ae0d22b@sentry.io/144189').addPlugin(RavenVue, Vue).install();
}

Vue.prototype.$toast = Toast;
let $background = chrome.extension.getBackgroundPage();
Vue.prototype.$background = $background;

Vue.use(VueRouter);
Vue.use(Bus);

router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.auth)) {
        if ($background.authenticated) {
            next();
        } else {
            next({
                path: '/welcome',
                query: {
                    redirect: to.fullPath,
                }
            });
        }
    } else {
        next();
    }
});

let app = new Vue({
    router,
    render(createElement) {
        return createElement('router-view');
    },
    mixins: [ga],
    destroyed() {
        Vue.prototype.$background = null;
    }
});
app.$mount('#vue');