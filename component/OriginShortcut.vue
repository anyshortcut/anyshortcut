<template>
    <div id="origin" class="inline-box-item">
        <button v-show="items" @click="clear" id="clear" style="float: right"
                class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">Clear
        </button>
        <ul class="mdl-list">
            <li v-for="item in items" class="mdl-list__item" style="float: left" track-by="$index">
                <div class="mdl-card mdl-shadow--2dp">
                    <div class="mdl-card__title mdl-card--expand"
                         style="background:url('{{item.value.favicon}}') no-repeat center/30% #46B6AC">
                        <button class="mdl-button"
                                style="float:right;top:5px;right:5px;position:absolute;color:white"
                                @click="deleteItem(item)">delete
                        </button>
                        <h1 style="color:white;font-weight:bold" class="mdl-card__title-text">{{item.key}}</h1>
                    </div>
                    <div class="mdl-card__supporting-text">
                        <a href="{{item.value.url}}">{{item.value.url}}</a>
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>
<style>
</style>
<script type="text/ecmascript-6">
    const storage = chrome.storage.local;
    import keyCodeHelper from '../js/keycode.js';

    export default{
        el(){
            return 'origin';
        },
        data(){
            return {
                items: null
            }
        },
        created: function() {
            this.queryItems();
        },
        methods: {
            queryItems: function() {
                storage.get(null, items => {
                    var array = [];
                    Object.keys(items).map(key => {
                        // Check the key whether is valid, filter other non-key info.
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
                if (confirm('Are you sure to clear all data?')) {
                    //Notify background.js to clear all data in storage.
                    this.items = null;
                }
            }
        }
    }
</script>