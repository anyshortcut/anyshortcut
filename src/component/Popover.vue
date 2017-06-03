<template>
    <div v-if="shortcut && !forceBinding">
        <p>{{keyChar}}</p>
        <p>{{shortcut.comment || shortcut.title}}</p>
        <button @click="forceBinding = true">Still bind the shortcut?</button>
    </div>
    <div v-else>
        Bind shortcut key!
        <p>{{keyChar}}</p>
        <input v-model="comment" placeholder="Comment for this url"
               autofocus @focus.native="$event.target.select()" required/>
        <br>
        <input @click="bind" type="button" value="Save"/>
    </div>
</template>
<style lang="css">
</style>
<script type="es6">
    export default{
        name: 'Popper',
        data(){
            return {
                comment: null,
                forceBinding: false,// Bind shortcut by force or not
            }
        },
        props: {
            keyChar: {
                type: String,
                default: null,
            },
            tabTitle: {
                type: String,
            },
            shortcut: {
                type: Object,
                default: function() {
                    return {};
                },
            }
        },
        watch: {
            keyChar: function() {
                this.forceBinding = false;
            },
            tabTitle: function(newValue) {
                if (this.tabTitle) {
                    this.comment = newValue.substring(0, 20);
                } else {
                    this.comment = '';
                }
            }
        },
        methods: {
            bind: function() {
                this.$emit('bind-click', this.keyChar, this.comment, this.forceBinding);
            }
        }
    }
</script>