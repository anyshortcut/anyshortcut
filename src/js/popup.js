import Vue from "vue";
import auth from "./background/auth.js";
import WelcomeView from "../view/Welcome.vue";
import MainView from "../view/Main.vue";
import PreferenceView from "../view/Preferences.vue";
import Toast from "../component/toast.js";
import Bus from "./vue-bus.js";

Vue.prototype.$toast = Toast;
Vue.prototype.$background = chrome.extension.getBackgroundPage();

Vue.directive('visible', function(el, binding) {
    if (binding.value) {
        el.style.visibility = 'visible';
    } else {
        el.style.visibility = 'hidden';
    }
});
Vue.use(Bus);

let app = new Vue({
    data: {
        currentView: null,
        loading: false,
    },
    components: {
        WelcomeView,
        MainView,
        PreferenceView,
    },
    computed: {
        authenticated: function() {
            return auth.isAuthenticated();
        }
    },
    methods: {
        bindShortcut: function(primary, keyChar, comment) {
            let bindFunction;
            if (primary) {
                bindFunction = this.$background.bindPrimaryShortcut;
            } else {
                bindFunction = this.$background.bindSecondaryShortcut;
            }

            this.loading = true;
            bindFunction(keyChar, comment, result => {
                this.onPostBind(result);
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
                    this.onPostUnbind(result);
                });
            }
        },
        onPostBind: function(result) {
            this.loading = false;

            if (result) {
                this.$background.setPopupIcon(true);
                this.$refs.main.queryShortcuts();
                this.$toast.success('Great job! you have bound a shortcut for this url!');
            }
            else {
                this.$toast.error('Ooops!');
            }
        },
        onPostUnbind: function(result) {
            this.loading = false;

            if (result) {
                this.$background.setPopupIcon(false);

                this.$toast.success('Delete Success!');
                this.$refs.main.queryShortcuts();
            } else {
                this.$toast.error('Ooops!');
            }
        },
    },
    mounted() {
        this.$bus.on('bind-shortcut', this.bindShortcut);
        this.$bus.on('unbind-shortcut', this.unbindShortcut);
    }
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