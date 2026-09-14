// In-memory state of the background service worker.
//
// A MV3 service worker can be killed at any time, so nothing here is a
// source of truth: shortcuts live in chrome.storage.local, the active tab
// is re-queried on wake, and recent-tab history is persisted to
// chrome.storage.session by tabs.ts. Every event handler awaits ready()
// before touching this state.
import storage from '../storage';
import common from '../common';
import prefs from '../prefs';
import type { PrimaryShortcuts, SecondaryShortcuts } from '../types';

interface BackgroundState {
  activeTab: chrome.tabs.Tab | null;
  primaryShortcuts: PrimaryShortcuts;
  secondaryShortcuts: SecondaryShortcuts;
}

const state: BackgroundState = {
  activeTab: null,
  primaryShortcuts: {},
  secondaryShortcuts: {},
};

async function loadShortcuts(): Promise<void> {
  const shortcuts = await storage.getAllShortcuts();
  state.primaryShortcuts = shortcuts.primary || {};
  state.secondaryShortcuts = shortcuts.secondary || {};
}

let readyPromise: Promise<unknown> | null = null;

export function ready(): Promise<unknown> {
  if (!readyPromise) {
    readyPromise = Promise.all([
      loadShortcuts(),
      prefs.init(),
      new Promise<void>((resolve) => {
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
