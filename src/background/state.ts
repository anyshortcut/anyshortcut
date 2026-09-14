// In-memory state of the background service worker.
//
// A MV3 service worker can be killed at any time, so nothing here is a
// source of truth: shortcuts are read back from chrome.storage, the active
// tab is re-queried on wake, and recent-tab history is persisted to
// chrome.storage.session by tabs.ts. Every event handler awaits ready()
// before touching this state.
//
// In cloud mode chrome.storage holds the mirror of the last successful
// sync rather than the shortcuts themselves, so key presses stay instant
// and keep working while offline; refreshCloudShortcuts() pulls a new copy
// in the background.
import backend, { NotAuthenticatedError } from '../backend';
import storage from '../storage';
import common from '../common';
import prefs, { PREFS_KEY } from '../prefs';
import type { PrimaryShortcuts, SecondaryShortcuts } from '../types';

interface BackgroundState {
  activeTab: chrome.tabs.Tab | null;
  primaryShortcuts: PrimaryShortcuts;
  secondaryShortcuts: SecondaryShortcuts;
  /** Cloud mode only: false once the server has told us there is no session. */
  authenticated: boolean;
  /** Cloud mode only: last known subscription status. */
  subscriptionStatus: string;
}

const state: BackgroundState = {
  activeTab: null,
  primaryShortcuts: {},
  secondaryShortcuts: {},
  authenticated: true,
  subscriptionStatus: 'active',
};

async function loadShortcuts(): Promise<void> {
  // Re-read preferences first: this also runs from the storage.onChanged
  // handler below, where the mode itself may be what changed, and waiting
  // on prefs here avoids depending on which listener chrome calls first.
  await prefs.init();
  const shortcuts = await storage.readSnapshot(prefs.getMode());
  state.primaryShortcuts = shortcuts.primary || {};
  state.secondaryShortcuts = shortcuts.secondary || {};
}

/**
 * Pull a fresh copy from the server in cloud mode. Writing the mirror fires
 * storage.onChanged, which is what reloads the in-memory copy, so there is
 * nothing to do with the result here. Failures are expected (offline, signed
 * out) and leave the previous mirror in place.
 */
export async function refreshCloudShortcuts(): Promise<void> {
  if (prefs.getMode() !== 'cloud') {
    // Local mode has no account, so nothing can be expired or signed out.
    state.authenticated = true;
    state.subscriptionStatus = 'active';
    return;
  }
  try {
    const info = await backend.getUserInfo();
    state.authenticated = true;
    state.subscriptionStatus = info.subscription?.status ?? 'active';
    await backend.getAllShortcuts();
  } catch (error) {
    if (error instanceof NotAuthenticatedError) {
      // Tell the content script to prompt for sign-in instead of reporting
      // every shortcut as unbound.
      state.authenticated = false;
      return;
    }
    // Offline or server trouble: keep serving the mirrored copy.
    console.log('Cloud sync skipped:', (error as Error).message);
  }
}

let readyPromise: Promise<void> | null = null;

export function ready(): Promise<void> {
  if (!readyPromise) {
    readyPromise = Promise.all([
      loadShortcuts(),
      new Promise<void>((resolve) => {
        common.getCurrentTab((tab) => {
          state.activeTab = tab || null;
          resolve();
        });
      }),
    ])
      .then(() => {
        // Serve the mirrored copy immediately and let the network catch up.
        refreshCloudShortcuts();
      })
      .catch((error) => {
        console.error('Failed to hydrate background state:', error);
        // Allow a later event to retry instead of caching the failure.
        readyPromise = null;
      });
  }
  return readyPromise;
}

// Reload the in-memory copy whenever shortcuts are written: by the popup in
// local mode, by a cloud sync, or because the user switched modes.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  const watched = [
    storage.STORAGE_KEYS.PRIMARY_SHORTCUTS,
    storage.STORAGE_KEYS.SECONDARY_SHORTCUTS,
    storage.STORAGE_KEYS.CLOUD_PRIMARY_SHORTCUTS,
    storage.STORAGE_KEYS.CLOUD_SECONDARY_SHORTCUTS,
    PREFS_KEY,
  ];
  if (watched.some((key) => changes[key])) {
    loadShortcuts();
  }
});

export { loadShortcuts };
export default state;
