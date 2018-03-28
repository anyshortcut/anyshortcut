import Vue from "vue";
import VueRouter from 'vue-router';
import ga from "./mixin-ga.js";
import router from "@/router";
import Toast from "../component/toast.js";
import Bus from "./vue-bus.js";

import Raven from "raven-js";
import RavenVue from 'raven-js/plugins/vue';

Raven.config('https://0aa6274679824a129c33c2cc4ae0d22b@sentry.io/144189').addPlugin(RavenVue, Vue).install();

Vue.prototype.$toast = Toast;
let $background = chrome.extension.getBackgroundPage();
Vue.prototype.$background = $background;

Vue.directive('visible', function(el, binding) {
    if (binding.value) {
        el.style.visibility = 'visible';
    } else {
        el.style.visibility = 'hidden';
    }
});
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
    data: {
        loading: false,
    },
    router,
    render: createElement => createElement('router-view'),
    methods: {
        bindShortcut: function(primary, keyChar, comment) {
            let bindFunction;
            if (primary) {
                bindFunction = this.$background.bindPrimaryShortcut;
            } else {
                bindFunction = this.$background.bindSecondaryShortcut;
            }

            this.loading = true;
            bindFunction(keyChar, comment, (result, shortcut) => {
                this.loading = false;

                if (result) {
                    if (this.$router.currentRoute.name === 'main') {
                        this.$bus.emit('refresh-main-view');
                    } else if (this.$router.currentRoute.name === 'compound') {
                        this.$router.replace({name: 'main'});
                    }

                    this.$background.setPopupIcon(true);
                    // this.$toast.success('Great job! you have bound a shortcut for this url!');

                    this.$background.notifyActiveTabShortcutBindSuccess(shortcut);
                }
                else {
                    // this.$toast.error('Ooops!');
                }
            });
        },
        unbindShortcut: function(shortcut) {
            if (shortcut) {
                let removeFunction;
                if (shortcut.primary) {
                    removeFunction = this.$background.removePrimaryShortcut;
                } else {
                    removeFunction = this.$background.removeSecondaryShortcut;
                }

                this.loading = true;
                removeFunction(shortcut, result => {
                    this.loading = false;

                    if (result) {
                        if (this.$router.currentRoute.name === 'main') {
                            this.$bus.emit('refresh-main-view');
                        } else if (this.$router.currentRoute.name === 'compound') {
                            this.$bus.emit('refresh-compound-view');
                        }

                        this.$background.setPopupIcon(false);
                        // this.$toast.success('Delete Success!');
                    } else {
                        // this.$toast.error('Ooops!');
                    }
                });
            }
        },
    },
    mixins: [ga],
    mounted() {
        this.$bus.on('bind-shortcut', this.bindShortcut);
        this.$bus.on('unbind-shortcut', this.unbindShortcut);
    },
    destroyed() {
        Vue.prototype.$background = null;
    }
});
app.$mount('#vue');