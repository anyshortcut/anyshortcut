import Vue from 'vue';
import dayjs from 'dayjs';

Vue.filter('dollar', cent => {
    return '$' + (cent / 100.0).toPrecision(3);
});
Vue.filter('date', timestamp => {
    return new Date(timestamp).toLocaleDateString();
});
Vue.filter('datetime', timestamp => {
    return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
});
Vue.filter('capitalize', function (value) {
    if (!value) return '';
    value = value.toString();
    return value.charAt(0).toUpperCase() + value.slice(1)
});
Vue.filter('savedTimes', function (openTimes) {
    let savedSecond = openTimes * 3;

    if (savedSecond === 0) {
        return '0 second';
    }

    if (savedSecond < 60 * 5) {
        return savedSecond + ' seconds';
    }

    return savedSecond / 60.0 + ' minutes';
});