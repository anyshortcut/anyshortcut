<template>
    <div>
        <div v-show="!bound">
            <div v-show="bound">
                <p>The url already bound with <b>ALT+{{key}}</b></p>
            </div>
            <div v-else>
                <keyboard :bound-keys="boundKeys" :key.sync="key"></keyboard>
                <input v-model="comment" placeholder="Comment for this url" required/>

                <button @click="handleOptionShortcutBinding">Bound</button>
            </div>
        </div>
        <ul v-show="items">
            <p>Here is option access bound list for this domain:</p>
            <li v-for="item in items">
                <span><b>{{$key}}</b></span>
                <span>    <a href="{{item.url}}" target="_blank">{{item.comment || item.title}}</a></span>
            </li>
        </ul>
    </div>
</template>
<style>
</style>
<script type="text/ecmascript-6">
    import common from '../js/common.js';
    import Keyboard from './Keyboard.vue';

    export default{
        name: 'OptionBound',
        data(){
            return {
                bound: false,
                key: '',// Shortcut key for option bound
                comment: '', // Option item comment.
                items: null,
                boundKeys: null,
            }
        },
        props: {
            show: {
                type: Boolean,
                default: function() {
                    return true;
                }
            },
            //Current active tab
            tab: {
                type: Object,
                required: true
            }
        },
        components: {
            Keyboard
        },
        watch: {
            'tab': function() {
                this.queryOptionItems();
            }
        },
        methods: {
            handleOptionShortcutBinding: function() {
                chrome.runtime.sendMessage({
                    secondarySave: true,
                    key: this.key,
                    comment: this.comment
                }, result => {
                    if (result) {
                        this.queryOptionItems();
                    }
                });
            },
            queryOptionItems() {
                chrome.runtime.sendMessage({secondaryCheck: true}, items => {
                    this.items = items;
                    this.boundKeys = items ? Object.keys(items) : null;

                    let url = this.tab.url;
                    for (let key in items) {
                        // Simply checks to see if this is a property specific to this class,
                        // and not one inherited from the base class.
                        if (items.hasOwnProperty(key)) {
                            let item = items[key];
                            if (common.isUrlEquivalent(item.url, url)) {
                                this.key = key;
                                this.bound = true;
                                break;
                            }
                        }
                    }
                });
            }
        }
    }
</script>