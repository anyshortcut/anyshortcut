import Vue from 'vue';

Vue.filter('dollar', cent => {
    return '$' + (cent / 100.0).toPrecision(3);
});
Vue.filter('date', timestamp => {
    return new Date(timestamp).toLocaleDateString();
});
Vue.filter('capitalize', function(value) {
    if (!value) return '';
    value = value.toString();
    return value.charAt(0).toUpperCase() + value.slice(1)
});
Vue.filter('savedTimes', function(openTimes) {
    let savedSecond = openTimes * 3;

    if (savedSecond === 0) {
        return '0 second';
    }

    if (savedSecond < 60 * 5) {
        return savedSecond + ' seconds';
    }

    return savedSecond / 60.0 + ' minutes';
});
Vue.directive('visible', function(el, binding) {
    if (binding.value) {
        el.style.visibility = 'visible';
    } else {
        el.style.visibility = 'hidden';
    }
});