const storage = chrome.storage.local;

$(function() {
    Vue.config.debug = true;
    var vm = new Vue({
        el: '#app',
        data: {
            items: null
        },
        created: function() {
            this.queryItems();
        },
        methods: {
            queryItems: function() {
                storage.get(null, items => {
                    // this pointer is correct in arrow functions.
                    this.items = items;
                });
            },
            deleteItem: function(key) {
                storage.remove(key);
                this.queryItems();
            },
            clear: function() {
                //Notify background.js to clear all data in storage.
                this.items = null;
            }
        }
    });
});
