<template>
    <div>
        <div v-if="support">
            <p>Enable option access on this domain:
                <span>
                    <b>{{domain}}</b>
                </span>
                <input type="checkbox" v-model="items"/>
            </p>
            <div v-show="!bound">
                <div v-show="bound">
                    <p>The domain <b>{{domain}}</b> already bound with <b>ALT+{{key}}</b></p>
                </div>
                <div v-else>
                    <input v-model="key" @focus="showKeyboard = true" id="option-shortcut-key" placeholder="key"
                           maxlength="1"
                           required/>
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
        <div v-else>
            <p>This domain
                <b>{{domain}}</b>
                not support option access.:(</p>
        </div>
        <keyboard :bound-keys="boundKeys" :key.sync="key" :show.sync="showKeyboard"></keyboard>
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
                domain: '', // Current active tab url domain name.
                key: '',// Shortcut key for option bound
                comment: '', // Option item comment.
                support: false, // Current active tab url whether support.
                /**
                 * The all bound shortcut of the domain name.
                 * each item looks like this: {key :{url:string,title:string,time:long}}
                 */
                items: null,
                boundKeys: null,
                showKeyboard: false
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
                // Check current domain name whether can option access.
                let a = document.createElement('a');
                a.href = this.tab.url;
                let domainName = common.extractDomainName(a.hostname);
                this.support = (domainName !== null);
                this.domain = domainName || a.hostname;
                if (this.support) {
                    this.queryOptionItems(domainName);
                }
            }
        },
        methods: {
            handleOptionShortcutBinding: function() {
                let a = document.createElement('a');
                a.href = this.tab.url;
                let domainName = common.extractDomainName(a.hostname);

                let value = {
                    url: this.tab.url,
                    title: this.tab.title,
                    comment: this.comment,
                    time: Date.now()
                };
                chrome.runtime.sendMessage({
                    optionSave: true,
                    domain: domainName,
                    key: this.key,
                    value: value
                }, result => {
                    if (result) {
                        this.queryOptionItems(domainName)
                    }
                });
            },
            queryOptionItems(domainName) {
                chrome.runtime.sendMessage({optionCheck: true, domain: domainName}, items => {
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