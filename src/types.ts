/** A bound shortcut, stored in chrome.storage.local. */
export interface Shortcut {
  id: string;
  key: string;
  url: string;
  title?: string;
  domain: string;
  comment?: string;
  favicon?: string;
  primary: boolean;
  /** Key of the primary shortcut this secondary belongs to (display-only, set at query time). */
  parentKey?: string;
  open_times: number;
  created_time: number;
}

/** Primary shortcuts, keyed by shortcut key. */
export type PrimaryShortcuts = Record<string, Shortcut>;

/** Secondary shortcuts for one domain, keyed by shortcut key. */
export type DomainShortcuts = Record<string, Shortcut>;

/** All secondary shortcuts, nested by domain. */
export type SecondaryShortcuts = Record<string, DomainShortcuts>;

/** Sunday-first weekly open counts, keyed 0-6. */
export type WeekStats = Record<number, number>;

/**
 * Content script → background message. The protocol is flag-based
 * (one boolean flag selects the request type) for backwards compatibility.
 */
export interface BackgroundRequest {
  info?: boolean;
  jumpSecondary?: boolean;
  request?: boolean;
  query?: boolean;
  open?: boolean;
  listSecondary?: boolean;
  url?: string;
  key?: string;
  modifier?: string;
  firstKey?: string;
  secondKey?: string;
  shortcutId?: string;
}

/** Background → content script push message (bind success toast). */
export interface BindSuccessMessage {
  bindSuccess: true;
  shortcut: Shortcut;
  primaryShortcut?: Shortcut | null;
  delay: boolean;
  combinationKey: string;
}

export interface DefaultShortcut {
  id?: string;
  key: string;
  url: string;
  comment: string;
  favicon: string;
  active: boolean;
}

/**
 * Event payloads for the mitt bus. mitt only forwards a single event
 * argument, so multi-value events must be packed into one object
 * (the old Vue 2 bus supported var-args; mitt silently drops extras).
 */
export interface BindShortcutEvent {
  primary: boolean;
  keyChar: string;
  comment: string;
}

export interface UnbindShortcutEvent {
  shortcut: Shortcut;
  including?: boolean;
}
