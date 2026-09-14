// Local mode: chrome.storage is the source of truth and nothing leaves the
// browser. This is a thin adapter over src/storage.ts so both modes present
// the same interface to the popup, the tour page and the service worker.
import storage from '../storage';
import type { UserInfo } from '../types';
import type { AllShortcuts, Backend, BindShortcutInput } from './types';

const localBackend: Backend = {
  requiresAuth: false,

  getUserInfo(): Promise<UserInfo> {
    // There is no account in local mode; report an always-valid subscription
    // so the shared subscription checks stay out of the way.
    return Promise.resolve({
      user: {},
      subscription: { status: 'active', end_at: null },
    });
  },

  getAllShortcuts(): Promise<AllShortcuts> {
    return storage.getAllShortcuts();
  },

  bindShortcut(shortcut: BindShortcutInput) {
    return storage.bindShortcut(shortcut);
  },

  unbindShortcut(id: string, including?: boolean) {
    return storage.unbindShortcut(id, including);
  },

  increaseShortcutOpenTimes(id: string) {
    return storage.increaseShortcutOpenTimes(id);
  },

  getDefaultShortcuts() {
    return storage.getDefaultShortcuts();
  },

  bindDefaultShortcuts(keys: string) {
    return storage.bindDefaultShortcuts(keys);
  },

  getShortcutWeekStats() {
    return storage.getShortcutWeekStats();
  },

  getPrimarySecondaryShortcutWeekStats(primaryShortcutId: string) {
    return storage.getPrimarySecondaryShortcutWeekStats(primaryShortcutId);
  },
};

export default localBackend;
