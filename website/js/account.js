import config from "./config.js";
import Vue from 'vue';
import router from '@/route';
import filters from '@/libs/vue-filters.js';
import directives from '@/libs/vue-filters.js';
import Bus from '@/libs/vue-bus.js';

Vue.use(Bus);
new Vue({
    router,
    render: createElement => createElement('router-view'),
}).$mount('#app');

if (window.chrome && window.chrome.runtime) {
    window.chrome.runtime.sendMessage(config.extensionId, {refresh: true}, function (response) {
    });
}