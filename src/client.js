import storage from './storage.js';

export default {
  getUserInfo() {
    return storage.getUserInfo();
  },
  bindShortcut(shortcut) {
    return storage.bindShortcut(shortcut);
  },
  unbindShortcut(id, including) {
    return storage.unbindShortcut(id, including);
  },
  increaseShortcutOpenTimes(id) {
    return storage.increaseShortcutOpenTimes(id);
  },
  getAllShortcuts() {
    return storage.getAllShortcuts();
  },
  getDefaultShortcuts() {
    return storage.getDefaultShortcuts();
  },
  bindDefaultShortcuts(keys) {
    return storage.bindDefaultShortcuts(keys);
  },
  getShortcutWeekStats(shortcutId) {
    return storage.getShortcutWeekStats(shortcutId);
  },
  getPrimarySecondaryShortcutWeekStats(primaryShortcutId) {
    return storage.getPrimarySecondaryShortcutWeekStats(primaryShortcutId);
  },
};
