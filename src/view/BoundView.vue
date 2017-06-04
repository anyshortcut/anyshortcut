<template>
    <section>
        <div v-if="shortcut.primary">
            <span class="shortcut">ALT+SHIFT+{{ shortcut.key }}</span>
        </div>
        <div v-else>
            <p>The url already bound with <span class="shortcut">ALT+{{ shortcut.key }}</span></p>
        </div>
        <p id="bound_time">{{shortcut.created_time | fromNow}}</p>
        <button @click="handleShortcutUnbinding" id="unbind_shortcut_button">Delete Shortcut</button>
    </section>
</template>
<style lang="css">
    #unbind_shortcut_button {
        background-color: rgb(181, 61, 10);
        text-align: center;
        padding: 10px;
        color: white;
        align-self: center;
        border: none;
        border-radius: 3px;
        margin: 20px;
        width: 80%;
    }
</style>
<script type="es6">
    import moment from "moment";

    export default{
        name: 'bound-view',
        data(){
            return {};
        },
        props: {
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
                    let removeFunction;
                    if (this.shortcut.primary) {
                        removeFunction = this.$background.removePrimaryShortcut;
                    } else {
                        removeFunction = this.$background.removeSecondaryShortcut;
                    }

                    this.$emit('pre-unbind');
                    removeFunction(this.shortcut, result => {
                        this.$emit('post-unbind', result);
                    });
                }
            },
        }
    }
</script>