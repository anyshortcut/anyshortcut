import Vue from "vue";
import auth from "./background/auth.js";
import WelcomeView from "../view/Welcome.vue";
import MainView from "../view/Main.vue";
import PreferenceView from "../view/Preferences.vue";
import Message from "../component/message.js";

require("../less/popup.less");

Vue.prototype.$message = Message;

let app = new Vue({
    data: {
        currentView: null,
    },
    computed: {
        authenticated: function() {
            return auth.isAuthenticated();
        }
    },
    components: {
        WelcomeView,
        MainView,
        PreferenceView,
    },
});

function onHashChange() {
    let view = window.location.hash.replace(/#\/?/, '');
    if (view) {
        app.currentView = view;
    } else {
        window.location.hash = '#/main';
        app.currentView = 'main';
    }
}

window.addEventListener('hashchange', onHashChange);
onHashChange();

app.$mount('#vue');