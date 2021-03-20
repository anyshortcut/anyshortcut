import Vue from "vue";
import Tour from "./Tour.vue";
import Raven from "raven-js";
import RavenVue from 'raven-js/plugins/vue';


Raven.config('https://0aa6274679824a129c33c2cc4ae0d22b@sentry.io/144189').addPlugin(RavenVue, Vue).install();

new Vue({
    el: '#app',
    render: h => h(Tour),
});
