<template>
    <span v-if="">
        <span class="shortcut">
                {{ combinationKey }} + {{ shortcutKeyChar }}
            </span>
        <span v-if="isConflict"
              data-balloon="May conflict in Windows"
              data-balloon-pos="up">
                    <img src="../img/exclamation.svg" alt="!" style="vertical-align: middle;margin: 0 3px;">
        </span>
    </span>
</template>
<style lang="scss" scoped>
</style>
<script type="es6">
    import prefs from "../js/prefs.js";

    export default {
        name: 'ShortcutKey',
        data() {
            return {
                combinationKey: prefs.getDefaultCombinationKey().toUpperCase(),
                conflictKeys: ['D', 'F'],
            };
        },
        props: {
            keyChar: {
                type: String,
                default: function() {
                    return null;
                }
            },
            parentKeyChar: {
                type: String,
                default: function() {
                    return null;
                }
            },
        },
        computed: {
            shortcutKey: function() {
                return this.parentKeyChar ? this.parentKeyChar + this.keyChar : this.keyChar;
            },
            shortcutKeyChar: function() {
                return this.parentKeyChar ? [this.parentKeyChar, this.keyChar].join(' + ') : this.keyChar;
            },
            isConflict: function() {
                if (this.$background.platformOs === 'mac') {
                    return false;
                }

                for (let key of this.conflictKeys) {
                    if (this.shortcutKey && this.shortcutKey.includes(key)) {
                        return true;
                    }
                }
                return false;
            }
        },
    }
</script>