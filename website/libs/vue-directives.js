import Vue from "vue";

Vue.directive('visible', function (el, binding) {
    if (binding.value) {
        el.style.visibility = 'visible';
    } else {
        el.style.visibility = 'hidden';
    }
});