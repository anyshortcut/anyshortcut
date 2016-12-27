import Vue from "vue";
import OriginBound from "../../component/OriginBound.vue";
import OptionBound from "../../component/OptionBound.vue";
import common from "../common.js";
import auth from "../api/auth.js";

window.onload = function() {
    Vue.config.debug = true;

    let vm = new Vue({
        el: 'body',
        data: {
            tab: {}
        },
        computed: {
            authenticated: function() {
                return auth.isAuthenticated();
            }
        },
        components: {
            OriginBound,
            OptionBound
        },
        methods: {
            loginWithGoogle: function() {
                auth.openAuthPopupWindow();
            }
        },
        created: function() {
            common.getCurrentTab(tab => {
                this.tab = tab;
            });
        }
    });
};