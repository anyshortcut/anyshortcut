<template>
    <div>
        <div id="bound_tips">{{boundTips}}</div>

        <div id="unbind_div" v-show="bound">
            <div id="unbind_guide">
                <span>
                    <strong>ALT</strong>
                </span>
                <span>+</span>
                <span>
                    <strong>SHIFT</strong>
                </span>
                <span>+</span>
                <span>
                    <strong id="bound_shortcut_key">{{key}}</strong>
                </span>
                <p id="bound_time">{{value.time | fromNow}}</p>
                <button @click="handleShortcutUnbinding" id="unbind_shortcut_button">Delete Shortcut</button>
            </div>
        </div>
        <div id="bind_div" v-else>
            <div id="bind_guide">
                <p>
                    Specify the shortcut:
                </p>
                <span>
                    <strong>ALT</strong>
                </span>
                <span>+</span>
                <span>
                    <strong>SHIFT</strong>
                </span>
                <span>+</span>
                <span>
                    <input v-model="key" @click="showKeyboard = true"
                           id="shortcut_key" placeholder="key" maxlength="1" required/>
                </span>
                <br/>
                <input @click="handleShortcutBinding" id="bind_shortcut_button" type="button" value="Save"/>
            </div>
        </div>
        <keyboard :bound-keys="boundKeys" :key.sync="key" :show.sync="showKeyboard"></keyboard>
    </div>

</template>
<style>
</style>
<script type="text/ecmascript-6">
    import moment from 'moment';
    import Keyboard from './Keyboard.vue';

    export default{
        name: 'OriginBound',
        data(){
            return {
                bound: false, // A flag indicate origin bound.
                key: '', // Shortcut key for origin bound.
                value: {}, // Origin bound value.
                boundTips: '',// Origin bound tips.
                boundKeys: null,// All bound keys, for keyboard component usage.
                showKeyboard: false
            }
        },
        props: {
            //Current active tab
            tab: {
                type: Object,
                required: true
            }
        },
        components: {
            Keyboard
        },
        filters: {
            //Custom filter to use moment.js format time as fromNow type.
            fromNow: function(time) {
                return moment(time).fromNow();
            }
        },
        watch: {
            //Watch the tab value async update,then to check the url whether bound.
            'tab': function() {
                let url = this.tab.url;
                // Request check current tab url was bound in background.js
                chrome.runtime.sendMessage({check: true, url: url}, bindInfo => {
                    // bind info. {"key":key,"value":value}
                    //TODO How to check javascript object null or undefined properly?
                    if (bindInfo) {
                        this.bound = true;
                        this.key = bindInfo.key;
                        this.value = bindInfo.value;
                    }
                });
            }
        },
        methods: {
            handleShortcutBinding: function() {
                let binding = {};
                binding[this.key] = {
                    url: this.tab.url,
                    title: this.tab.title,
                    favicon: this.tab.favIconUrl,
                    time: Date.now()
                };

                chrome.runtime.sendMessage({save: true, data: binding}, response => {
                    this.bound = true;
                    this.boundTips = 'Great job!you have bound a shortcut for this url!';
                });
            },
            handleShortcutUnbinding: function() {
                chrome.runtime.sendMessage({delete: true, url: this.tab.url}, result => {
                    if (result) {
                        this.bound = false;
                        this.key = '';
                        this.value = {};

                        this.boundTips = 'Delete Success!';
                    }
                });
            }
        },
        created: function() {
            chrome.runtime.sendMessage({keys: true}, keys => {
                this.boundKeys = keys ? keys : null;
            });
        }
    }
</script>