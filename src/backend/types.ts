import type {
  DefaultShortcut,
  PrimaryShortcuts,
  SecondaryShortcuts,
  Shortcut,
  UserInfo,
  WeekStats,
} from '../types';

/** Input for binding a new shortcut; ids and counters are assigned by the backend. */
export interface BindShortcutInput {
  key: string;
  url: string;
  title?: string;
  domain: string;
  comment?: string;
  favicon?: string;
  primary: boolean;
}

export interface AllShortcuts {
  primary: PrimaryShortcuts;
  secondary: SecondaryShortcuts;
}

/**
 * Everything the popup, the tour page and the service worker need from a
 * data source. Implemented twice: against chrome.storage (local mode) and
 * against api.anyshortcut.com (cloud mode).
 */
export interface Backend {
  /** Whether this backend needs the user to be signed in. */
  readonly requiresAuth: boolean;
  getUserInfo(): Promise<UserInfo>;
  getAllShortcuts(): Promise<AllShortcuts>;
  bindShortcut(shortcut: BindShortcutInput): Promise<Shortcut>;
  unbindShortcut(id: string, including?: boolean): Promise<void>;
  increaseShortcutOpenTimes(id: string): Promise<Shortcut | undefined>;
  getDefaultShortcuts(): Promise<DefaultShortcut[]>;
  bindDefaultShortcuts(keys: string): Promise<void>;
  getShortcutWeekStats(shortcutId: string): Promise<WeekStats>;
  getPrimarySecondaryShortcutWeekStats(primaryShortcutId: string): Promise<WeekStats>;
}

/** Thrown when the cloud backend is reachable but the user is not signed in. */
export class NotAuthenticatedError extends Error {
  constructor(message = 'Not signed in to anyshortcut.com') {
    super(message);
    this.name = 'NotAuthenticatedError';
  }
}
