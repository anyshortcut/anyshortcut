import Vue from "vue";
import auth from "./background/auth.js";
import WelcomeView from "../view/Welcome.vue";
import MainView from "../view/Main.vue";
import PreferenceView from "../view/Preferences.vue";

require("../less/popup.less");

window.onload = function() {
    let vm = new Vue({
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
        created(){
            if (auth.isAuthenticated()) {
                this.currentView = MainView;
            } else {
                this.currentView = WelcomeView;
            }
        }
    });
};