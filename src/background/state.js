// In-memory state of the background service worker.
//
// A MV3 service worker can be killed at any time, so nothing here is a
// source of truth: shortcuts live in chrome.storage.local, the active tab
// is re-queried on wake, and recent-tab history is persisted to
// chrome.storage.session by tabs.js. Every event handler awaits ready()
// before touching this state.
import storage from '../storage.js';
import common from '../common.js';
import prefs from '../prefs.js';

const state = {
  activeTab: null,
  primaryShortcuts: {},
  secondaryShortcuts: {},
};

async function loadShortcuts() {
  const shortcuts = await storage.getAllShortcuts();
  state.primaryShortcuts = shortcuts.primary || {};
  state.secondaryShortcuts = shortcuts.secondary || {};
}

let readyPromise = null;

export function ready() {
  if (!readyPromise) {
    readyPromise = Promise.all([
      loadShortcuts(),
      prefs.init(),
      new Promise((resolve) => {
        common.getCurrentTab((tab) => {
          state.activeTab = tab || null;
          resolve();
        });
      }),
    ]).catch((error) => {
      console.error('Failed to hydrate background state:', error);
    });
  }
  return readyPromise;
}

// Reload the in-memory copy whenever the popup or tour page writes
// shortcuts to chrome.storage.
chrome.storage.onChanged.addListener((changes, area) => {
  if (
    area === 'local' &&
    (changes[storage.STORAGE_KEYS.PRIMARY_SHORTCUTS] ||
      changes[storage.STORAGE_KEYS.SECONDARY_SHORTCUTS])
  ) {
    loadShortcuts();
  }
});

export { loadShortcuts };
export default state;
