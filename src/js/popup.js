import Vue from "vue";
import auth from "./background/auth.js";
import WelcomeView from "../view/Welcome.vue";
import MainView from "../view/Main.vue";
import PreferenceView from "../view/Preferences.vue";

require("../less/popup.less");

let MessageConstructor = Vue.extend(require("../component/Message.vue"));

let instances = [];
let seed = 1;

let Message = function(options) {
    options = options || {};
    if (typeof options === 'string') {
        options = {
            message: options
        };
    }
    let userOnClose = options.onClose;
    let id = 'message_' + seed++;

    options.onClose = function() {
        Message.close(id, userOnClose);
    };

    let instance = new MessageConstructor({
        data: options
    });
    instance.id = id;
    instance.vm = instance.$mount();
    document.body.appendChild(instance.vm.$el);
    instance.vm.visible = true;
    instance.dom = instance.vm.$el;
    instance.dom.style.zIndex = 10000;
    instances.push(instance);
    return instance.vm;
};

['success', 'warning', 'info', 'error'].forEach(type => {
    Message[type] = options => {
        if (typeof options === 'string') {
            options = {
                message: options
            };
        }
        options.type = type;
        return Message(options);
    };
});

Message.close = function(id, userOnClose) {
    for (let i = 0, len = instances.length; i < len; i++) {
        if (id === instances[i].id) {
            if (typeof userOnClose === 'function') {
                userOnClose(instances[i]);
            }
            instances.splice(i, 1);
            break;
        }
    }
};

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