const storage = chrome.storage.local;

$(function() {
    Vue.config.debug = true;
    var vm = new Vue({
        el: '#app',
        data:{
            items:[]
        },
        created: function() {
            this.queryItems();
        },
        methods: {
            queryItems: function() {
                //Notice: this points to the vm instance
                var self = this;
                storage.get(null, function(items) {
                    self.items = items;
                    console.log('options:' + JSON.stringify(items));
                });
            }
        }
    });
});
