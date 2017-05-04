<template>
    <div>
        <a href="#/main"><i class="fa fa-chevron-circle-left" aria-hidden="true"></i>back</a>
        <div>
            How to open primary shortcut:
            <form>
                <input type="radio" id="p_blank" v-model='preference.primary_blank' value="true">
                <label for="p_blank">Open in new tab</label>
                <br>
                <input type="radio" id="p_self" v-model="preference.primary_blank" value="false">
                <label for="p_self">Open in same tab</label>
            </form>
            <br>

            How to open secondary shortcut:
            <form>
                <input type="radio" id="s_blank" v-model="preference.secondary_blank" value="true">
                <label for="s_blank">Open in new tab</label>
                <br>
                <input type="radio" id="s_self" v-model="preference.secondary_blank" value="false">
                <label for="s_self">Open in same tab</label>
            </form>
            <br>

            How to quick open secondary shortcut:
            <form>
                <input type="radio" id="qs_blank" v-model="preference.quick_secondary_blank" value="true">
                <label for="qs_blank">Open in new tab</label>
                <br>
                <input type="radio" id="qs_self" v-model="preference.quick_secondary_blank" value="false">
                <label for="qs_self">Open in same tab</label>
            </form>
        </div>
    </div>
</template>
<style lang="css">
</style>
<script type="es6">
    import prefs from "../js/prefs.js";
    export default{
        name: 'preference-view',
        data() {
            return {
                preference: prefs.localPreference()
            }
        },
        watch: {
            preference: {
                // use deep property to watch nested property changed.
                deep: true,
                handler: function(newValue) {
                    prefs.update(newValue);
                }
            }
        },
    };
</script>