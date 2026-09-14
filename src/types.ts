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
 * Where shortcuts live.
 *
 * - `cloud`: anyshortcut.com is the source of truth, reached with the session
 *   cookie from signing in on the website. Shortcuts are mirrored into
 *   chrome.storage so the service worker can answer key presses without a
 *   network round trip and while offline.
 * - `local`: chrome.storage is the source of truth; nothing leaves the browser.
 *
 * Each mode keeps its own data, so switching back and forth loses nothing.
 */
export type BackendMode = 'cloud' | 'local';

export interface Subscription {
  status: string | null;
  end_at: string | null;
}

export interface User {
  id?: number;
  email?: string;
  name?: string;
  avatar?: string;
  access_token?: string;
}

export interface UserInfo {
  user: User;
  subscription: Subscription;
}

/**
 * Content script → background message. The protocol is flag-based
 * (one boolean flag selects the request type) for backwards compatibility.
 */
export interface BackgroundRequest {
  info?: boolean;
  /** Firefox-only: forwarded by the auth helper content script. */
  firefoxRefresh?: boolean;
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

/**
 * anyshortcut.com → extension message, delivered through
 * chrome.runtime.onMessageExternal (Chrome) when the user signs in or
 * edits shortcuts on the website.
 */
export interface ExternalRequest {
  authenticated?: boolean;
  refresh?: boolean;
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
