import Vue from 'vue';
import OriginBound from '../component/OriginBound.vue'
import OptionBound from '../component/OptionBound.vue'

import common from './common.js';
import Firebase from  'firebase';

let firebase = new Firebase('https://shurl.firebaseio.com');

window.onload = function() {
    Vue.config.debug = true;

    let vm = new Vue({
        el: 'body',
        data: {
            tab: {}
        },
        computed: {
            authenticated: function() {
                return !!firebase.getAuth();
            },
            authId: function() {
                return firebase.getAuth.uid;
            }
        },
        components: {
            OriginBound,
            OptionBound
        },
        created: function() {
            common.getCurrentTab(tab => {
                this.tab = tab;
            });
        }
    });
};