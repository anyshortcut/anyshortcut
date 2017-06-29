export default {
    methods: {
        handleShortcutBinding: function(keyChar, comment) {
            let bindFunction;
            if (this.primary) {
                bindFunction = this.$background.bindPrimaryShortcut;
            } else {
                bindFunction = this.$background.bindSecondaryShortcut;
            }

            this.$emit('pre-bind');
            bindFunction(keyChar, comment, result => {
                this.$emit('post-bind', result);
            });
        },
        handleShortcutUnbinding: function(shortcut) {
            if (shortcut) {
                let removeFunction;
                if (shortcut.primary) {
                    removeFunction = this.$background.removePrimaryShortcut;
                } else {
                    removeFunction = this.$background.removeSecondaryShortcut;
                }

                this.$emit('pre-unbind');
                removeFunction(shortcut, result => {
                    this.$emit('post-unbind', result);
                });
            }
        },
    }
};