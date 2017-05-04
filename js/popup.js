import Vue from "vue";
import auth from "./background/auth.js";
import WelcomeView from "../view/Welcome.vue";
import MainView from "../view/Main.vue";
import PreferenceView from "../view/Preferences.vue";

require("../less/popup.less");

window.onload = function() {
    let app = new Vue({
        el: '#vue',
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
};