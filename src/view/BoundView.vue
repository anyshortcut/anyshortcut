<template>
    <section>
        <div v-if="shortcut.primary">
                <span>
                    <strong>ALT</strong>
                </span>
            <span>+</span>
            <span>
                    <strong>SHIFT</strong>
                </span>
            <span>+</span>
            <span>
                    <strong id="bound_shortcut_key">{{shortcut.key}}</strong>
                </span>
        </div>
        <div v-else>
            <p>The url already bound with <b>ALT+{{shortcut.key}}</b></p>
        </div>
        <p id="bound_time">{{shortcut.created_time | fromNow}}</p>
        <button @click="handleShortcutUnbinding" id="unbind_shortcut_button">Delete Shortcut</button>
    </section>
</template>
<style lang="css">

</style>
<script type="es6">
    import moment from "moment";

    export default{
        name: 'bound-view',
        data(){
            return {};
        },
        props: {
            tabUrl: {
                type: String
            },
            shortcut: {
                type: Object,
                default: function() {
                    return {};
                },
            }
        },
        filters: {
            //Custom filter to use moment.js format time as fromNow type.
            fromNow: function(time) {
                return moment(time).fromNow();
            }
        },
        methods: {
            handleShortcutUnbinding: function() {
                if (this.shortcut) {
                    let options;
                    if (this.shortcut.primary) {
                        options = {
                            remove: true,
                            key: this.shortcut.key
                        }
                    } else {
                        options = {
                            secondaryRemove: true,
                            id: this.shortcut.id,
                            key: this.shortcut.key,
                            url: this.tabUrl,
                        }
                    }

                    this.$emit('pre-unbind');
                    chrome.runtime.sendMessage(options, result => {
                        this.$emit('post-unbind', result);
                    });

                }
            },
        }
    }
</script>