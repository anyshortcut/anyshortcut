import Popover from "../component/Popover.vue";
import ShortcutBoard from "../component/ShortcutBoard.vue";

export default {
    data() {
        return {
            keyChar: null,
            isPopoverShowing: false,
        }
    },
    props: {
        shortcuts: {
            type: Object,
            default: function() {
                return null;
            }
        },
    },
    computed: {
        // A mouse hovered shortcut computed object
        hoveredShortcut: function() {
            return this.shortcuts[this.keyChar];
        },
        // All bound keys, for keyboard component usage.
        boundKeys: function() {
            return Object.keys(this.shortcuts);
        },
        highlightKey: function() {
            if (this.isPopoverShowing && this.boundKeys.indexOf(this.keyChar) === -1) {
                return this.keyChar;
            } else {
                return null;
            }
        },
    },
    components: {
        Popover,
        ShortcutBoard,
    },
    methods: {
        onHoverOver: function(target) {
            this.keyChar = target.innerText;
            this.$refs.popover.render(target);
        },
        onHoverLeave: function() {
            this.$refs.popover.hidden();
        },
        onPopoverShowChange: function(showing) {
            this.isPopoverShowing = showing;
        }
    }
}