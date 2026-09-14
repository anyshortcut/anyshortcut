import { defineComponent } from 'vue';
import Popover from '../component/Popover.vue';
import ShortcutBoard from '../component/ShortcutBoard.vue';
import type { DomainShortcuts } from '../types';

export default defineComponent({
  data() {
    return {
      keyChar: null as string | null,
      isPopoverShowing: false,
    };
  },
  props: {
    shortcuts: {
      type: Object as () => DomainShortcuts | null,
      default: function () {
        return null;
      },
    },
  },
  computed: {
    // A mouse hovered shortcut computed object
    hoveredShortcut() {
      return this.keyChar ? this.shortcuts?.[this.keyChar] : undefined;
    },
    // All bound keys, for keyboard component usage.
    boundKeys(): string[] {
      return Object.keys(this.shortcuts ?? {});
    },
    highlightKey(): string | null {
      if (this.isPopoverShowing && this.keyChar && this.boundKeys.indexOf(this.keyChar) === -1) {
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
    onTableScroll() {
      (this.$refs.popover as InstanceType<typeof Popover>).dismiss();
    },
    onHoverOver(target: HTMLElement) {
      this.keyChar = target.innerText;
      (this.$refs.popover as InstanceType<typeof Popover>).render(target);
    },
    onHoverLeave() {
      (this.$refs.popover as InstanceType<typeof Popover>).hidden();
    },
    onPopoverShowChange(showing: boolean) {
      this.isPopoverShowing = showing;
    },
  },
});
