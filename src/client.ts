import storage from './storage';
import type { BindShortcutInput } from './storage';

export default {
  getUserInfo() {
    return storage.getUserInfo();
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
  getAllShortcuts() {
    return storage.getAllShortcuts();
  },
  getDefaultShortcuts() {
    return storage.getDefaultShortcuts();
  },
  bindDefaultShortcuts(keys: string) {
    return storage.bindDefaultShortcuts(keys);
  },
  getShortcutWeekStats(_shortcutId: string) {
    return storage.getShortcutWeekStats();
  },
  getPrimarySecondaryShortcutWeekStats(primaryShortcutId: string) {
    return storage.getPrimarySecondaryShortcutWeekStats(primaryShortcutId);
  },
};
