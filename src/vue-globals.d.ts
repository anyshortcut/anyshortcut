import type { ExtensionApi } from './extension-api';
import type { ToastFunction } from './component/toast';
import type { Emitter } from 'mitt';

declare module 'vue' {
  interface ComponentCustomProperties {
    /** Offline replacement for the MV2 background page, see src/extension-api.ts */
    $background: ExtensionApi;
    $toast: ToastFunction;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $bus: Emitter<Record<string, any>>;
  }
}

export {};
