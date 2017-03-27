import Vue from "vue";
import prefs from "./prefs.js";

window.onload = function() {
    let vm = new Vue({
        el: '#vue',
        data: {
            preference: prefs.localPreference()
        },
        watch: {
            preference: {
                // use deep property to watch nested property changed.
                deep: true,
                handler: function(newValue) {
                    prefs.update(newValue);
                }
            }
        },
    });
};