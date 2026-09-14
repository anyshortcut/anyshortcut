/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: DefineComponent<object, object, any>;
  export default component;
}

/**
 * Firefox's promise-native WebExtension namespace.
 * Absent in Chrome — always access through src/webext.ts.
 */
declare const browser: typeof chrome | undefined;

declare module 'scroll-into-view';

/** Page globals used by the content script. */
interface Window {
  /** Whether primary shortcut triggering should be delayed (compound/secondary exist). */
  delay?: boolean;
  /** Prevents the circle popup keys from clashing with the query chooser. */
  isQueryShortcutChooserShowing?: boolean;
}
