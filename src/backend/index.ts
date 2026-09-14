// The data source the extension is currently using.
//
// Every read and write goes through this module so the rest of the code
// never has to know whether shortcuts live on anyshortcut.com or only in
// this browser. The mode is a preference, so `prefs.init()` must have run
// in this context before any of these calls.
import prefs from '../prefs';
import cloudBackend from './cloud';
import localBackend from './local';
import type { Backend } from './types';

export { NotAuthenticatedError } from './types';
export type { AllShortcuts, Backend, BindShortcutInput } from './types';

/** The backend for the mode the user selected. */
export function activeBackend(): Backend {
  return prefs.getMode() === 'cloud' ? cloudBackend : localBackend;
}

/**
 * Delegating facade with the same shape as a Backend. Callers hold on to
 * this object, so the mode is resolved per call rather than at import time
 * and switching modes takes effect without a reload.
 */
const backend: Backend = {
  get requiresAuth() {
    return activeBackend().requiresAuth;
  },
  getUserInfo: () => activeBackend().getUserInfo(),
  getAllShortcuts: () => activeBackend().getAllShortcuts(),
  bindShortcut: (shortcut) => activeBackend().bindShortcut(shortcut),
  unbindShortcut: (id, including) => activeBackend().unbindShortcut(id, including),
  increaseShortcutOpenTimes: (id) => activeBackend().increaseShortcutOpenTimes(id),
  getDefaultShortcuts: () => activeBackend().getDefaultShortcuts(),
  bindDefaultShortcuts: (keys) => activeBackend().bindDefaultShortcuts(keys),
  getShortcutWeekStats: (id) => activeBackend().getShortcutWeekStats(id),
  getPrimarySecondaryShortcutWeekStats: (id) =>
    activeBackend().getPrimarySecondaryShortcutWeekStats(id),
};

export default backend;
