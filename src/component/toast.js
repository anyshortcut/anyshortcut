import Vue from "vue";
import ToastComponent from "./Toast.vue";

let ToastConstructor = Vue.extend(ToastComponent);

let instances = [];
let seed = 1;

let Toast = function(options) {
    options = options || {};
    if (typeof options === 'string') {
        options = {
            message: options
        };
    }
    let userOnClose = options.onClose;
    let id = 'toast_' + seed++;

    options.onClose = function() {
        Toast.close(id, userOnClose);
    };

    let instance = new ToastConstructor({
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
    Toast[type] = options => {
        if (typeof options === 'string') {
            options = {
                message: options
            };
        }
        options.type = type;
        return Toast(options);
    };
});

Toast.close = function(id, userOnClose) {
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

export default Toast;