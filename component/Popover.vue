<template>
    <div v-if="shortcut && !forceBinding">
        <p>{{keyChar}}</p>
        <p>{{shortcut.comment || shortcut.title}}</p>
        <button @click="forceBinding = true">Still bind the shortcut?</button>
    </div>
    <div v-else>
        Bind shortcut key!
        <p>{{keyChar}}</p>
        <input v-model="comment" placeholder="Comment for this url" required/>
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
                comment: null,// Shortcut comment
                forceBinding: false,// Bind shortcut by force or not
            }
        },
        props: {
            keyChar: {
                type: String,
                default: null,
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
            }
        },
        methods: {
            bind: function() {
                this.$emit('bind-click', this.keyChar, this.comment, this.forceBinding);
            }
        }
    }
</script>