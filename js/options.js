const storage = chrome.storage.local;

$(function() {
    Vue.config.debug = true;
    var vm = new Vue({
        el: 'body',
        data: {
            items: null
        },
        created: function() {
            this.queryItems();
        },
        methods: {
            queryItems: function() {
                storage.get(null, items => {
                    var array = [];
                    Object.keys(items).map(key => {
                        // Check the key whether is valid.
                        if (keyCodeHelper.isValidKey(key)) {
                            var item = {};
                            item['key'] = key;
                            item['value'] = items[key];
                            array.push(item);
                        }
                    });
                    // This pointer is correct in arrow functions.
                    this.items = array;
                });
            },
            deleteItem: function(item) {
                if (confirm('Are you sure to delete this one?')) {
                    this.items.$remove(item);
                    storage.remove(item.key);
                }
            },
            clear: function() {
                if (confirm('Are you sure to cear all data?')) {
                    //Notify background.js to clear all data in storage.
                    this.items = null;
                }
            }
        }
    });
});
