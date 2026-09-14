// Replacement for the MV2 chrome.extension.getBackgroundPage() bridge.
//
// In Manifest V3 extension pages cannot reach into the background service
// worker, and since the extension is offline-first they don't need to:
// this module exposes the same `$background` API surface the popup and
// tour page always used, implemented directly on chrome.storage/chrome.tabs.
// Call `await api.init()` before mounting the app; afterwards all property
// reads are synchronous, exactly like the old background page globals.
//
// Methods are standalone functions (not `this`-bound) because callers
// detach them, e.g. `bindFunction = this.$background.bindPrimaryShortcut`.
import backend, { NotAuthenticatedError } from './backend';
import common from './common';
import config from './config';
import prefs from './prefs';
import webext from './webext';
import type {
  BackendMode,
  BindSuccessMessage,
  DomainShortcuts,
  PrimaryShortcuts,
  SecondaryShortcuts,
  Shortcut,
  User,
} from './types';

const DEFAULT_FAVICON = chrome.runtime.getURL('icon/default_favicon.svg');
const BIND_TIMES_KEY = 'anyshortcut_bind_success_times';

export interface ExtensionApi {
  activeTab: chrome.tabs.Tab | null;
  platformOs: string | null;
  /** Cloud mode only: false until the user has signed in on the website. */
  authenticated: boolean;
  user: User | null;
  subscriptionStatus: string;
  subscriptionEndAt: string | null;
  primaryShortcuts: PrimaryShortcuts;
  secondaryShortcuts: SecondaryShortcuts;
  /** Where to send the user to sign in to cloud mode. */
  signInUrl: string;
  init(): Promise<ExtensionApi>;
  getMode(): BackendMode;
  setMode(mode: BackendMode): Promise<void>;
  isActiveTabUrlSupported(): boolean;
  checkSubscriptionExpired(): boolean;
  syncAllShortcuts(): Promise<void>;
  bindPrimaryShortcut(key: string, comment?: string): Promise<Shortcut>;
  bindSecondaryShortcut(key: string, comment?: string): Promise<Shortcut>;
  removePrimaryShortcut(shortcut: Shortcut, including?: boolean): Promise<void>;
  removeSecondaryShortcut(shortcut: Shortcut): Promise<void>;
  getSecondaryShortcutsByUrl(url: string): DomainShortcuts;
}

const api: ExtensionApi = {
  activeTab: null,
  platformOs: null,
  authenticated: true,
  user: null,
  subscriptionStatus: 'active',
  subscriptionEndAt: null,
  primaryShortcuts: {},
  secondaryShortcuts: {},
  signInUrl: config.accountURL,
  init,
  getMode,
  setMode,
  isActiveTabUrlSupported,
  checkSubscriptionExpired,
  syncAllShortcuts,
  bindPrimaryShortcut,
  bindSecondaryShortcut,
  removePrimaryShortcut,
  removeSecondaryShortcut,
  getSecondaryShortcutsByUrl,
};

async function init(): Promise<ExtensionApi> {
  const [tabs, platformInfo] = await Promise.all([
    webext.tabs.query({ active: true, currentWindow: true }),
    webext.runtime.getPlatformInfo(),
    // prefs must land before anything reads the mode.
    prefs.init(),
  ]);
  api.activeTab = tabs[0] || null;
  api.platformOs = platformInfo.os;
  await loadAccount();
  await syncAllShortcuts();
  return api;
}

function getMode(): BackendMode {
  return prefs.getMode();
}

/** Switch data source and reload everything from it. */
async function setMode(mode: BackendMode): Promise<void> {
  await prefs.setMode(mode);
  await loadAccount();
  await syncAllShortcuts();
}

/**
 * Read the signed-in account. Local mode has none, so this only really does
 * anything in cloud mode, where it also decides whether the popup should ask
 * the user to sign in.
 */
async function loadAccount(): Promise<void> {
  try {
    const info = await backend.getUserInfo();
    api.user = info.user ?? null;
    api.subscriptionStatus = info.subscription?.status ?? 'active';
    api.subscriptionEndAt = info.subscription?.end_at ?? null;
    api.authenticated = true;
  } catch (error) {
    if (error instanceof NotAuthenticatedError) {
      api.authenticated = false;
      api.user = null;
      return;
    }
    // The server is unreachable: keep working from the mirrored shortcuts
    // rather than locking the user out of a popup that would otherwise work.
    console.error('Failed to load account:', error);
    api.authenticated = true;
  }
}

function isActiveTabUrlSupported(): boolean {
  if (api.activeTab && api.activeTab.url) {
    try {
      return ['http:', 'https:', 'file:'].includes(new URL(api.activeTab.url).protocol);
    } catch {
      return false;
    }
  }
  return true;
}

function checkSubscriptionExpired(): boolean {
  // Local mode has no subscription to expire.
  if (prefs.getMode() === 'local') return false;
  return !['active', 'trialing'].includes(api.subscriptionStatus);
}

async function syncAllShortcuts(): Promise<void> {
  let primary: PrimaryShortcuts;
  let secondary: SecondaryShortcuts;
  try {
    ({ primary, secondary } = await backend.getAllShortcuts());
  } catch (error) {
    if (!(error instanceof NotAuthenticatedError)) throw error;
    // Signed out of cloud mode: show nothing rather than another mode's data.
    api.authenticated = false;
    api.primaryShortcuts = {};
    api.secondaryShortcuts = {};
    return;
  }
  // Ensure all shortcuts have a default favicon image.
  Object.values(primary).forEach((shortcut) => {
    if (!shortcut.favicon) shortcut.favicon = DEFAULT_FAVICON;
  });
  Object.values(secondary).forEach((domainShortcuts) => {
    Object.values(domainShortcuts).forEach((shortcut) => {
      if (!shortcut.favicon) shortcut.favicon = DEFAULT_FAVICON;
    });
  });
  api.primaryShortcuts = primary;
  api.secondaryShortcuts = secondary;
}

/**
 * Derive the shortcut domain from a url. The old server stripped the url
 * down to a registrable domain; offline we approximate with the hostname
 * minus a leading "www.", which is what isHostnameEndsWithDomain matches.
 */
function domainFromUrl(url: string): string {
  return common.getHostnameFromUrl(url).replace(/^www\./, '');
}

function getBoundDomainByHostname(hostname: string): string | null {
  for (const domain of Object.keys(api.secondaryShortcuts)) {
    if (common.isHostnameEndsWithDomain(hostname, domain)) {
      return domain;
    }
  }
  return null;
}

function getSecondaryShortcutsByUrl(url: string): DomainShortcuts {
  const hostname = common.getHostnameFromUrl(url);
  const domain = getBoundDomainByHostname(hostname);
  return domain ? api.secondaryShortcuts[domain] : {};
}

function getPrimaryShortcutByDomain(domain: string): Shortcut | null {
  for (const shortcut of Object.values(api.primaryShortcuts)) {
    if (shortcut.domain === domain) {
      return shortcut;
    }
  }
  return null;
}

function determineDelay(): boolean {
  return (
    Object.keys(api.secondaryShortcuts).length > 0 ||
    Object.keys(api.primaryShortcuts).some((key) => key.length === 2)
  );
}

function updatePopupIcon(bound: boolean): void {
  chrome.action.setIcon({
    path: {
      16: bound ? 'icon/icon32.png' : 'icon/icon32-gray.png',
    },
  });
}

/**
 * Show the in-page "bind success" toast in the active tab,
 * at most three times for each shortcut type.
 */
async function notifyActiveTabShortcutBindSuccess(shortcut: Shortcut): Promise<void> {
  if (!api.activeTab || api.activeTab.id === undefined) return;

  const counterKey = shortcut.primary ? 'primary' : 'secondary';
  const result = await webext.storage.local.get(BIND_TIMES_KEY);
  const counters = (result[BIND_TIMES_KEY] as Record<string, number> | undefined) || {};
  const showTimes = counters[counterKey] || 0;
  if (showTimes >= 3) return;

  counters[counterKey] = showTimes + 1;
  await webext.storage.local.set({ [BIND_TIMES_KEY]: counters });

  const payload: BindSuccessMessage = {
    bindSuccess: true,
    shortcut: shortcut,
    delay: determineDelay(),
    combinationKey: prefs.getDefaultCombinationKey(),
  };
  if (!shortcut.primary) {
    payload.primaryShortcut = getPrimaryShortcutByDomain(shortcut.domain);
    // No primary shortcut for this domain yet: nothing sensible to show.
    if (!payload.primaryShortcut) return;
  }
  webext.tabs.sendMessage(api.activeTab.id, payload).catch(() => {
    // The content script may not be injected in this tab; ignore.
  });
}

async function bindShortcut(
  key: string,
  comment: string | undefined,
  primary: boolean
): Promise<Shortcut> {
  const tab = api.activeTab;
  if (!tab || !tab.url) {
    throw new Error('No active tab to bind.');
  }

  const shortcut = await backend.bindShortcut({
    key: key,
    url: tab.url,
    title: tab.title,
    domain: domainFromUrl(tab.url),
    comment: comment,
    favicon: tab.favIconUrl || DEFAULT_FAVICON,
    primary: primary,
  });
  await syncAllShortcuts();

  if (primary) {
    updatePopupIcon(true);
  }
  notifyActiveTabShortcutBindSuccess(shortcut);
  return shortcut;
}

function bindPrimaryShortcut(key: string, comment?: string): Promise<Shortcut> {
  return bindShortcut(key, comment, true);
}

function bindSecondaryShortcut(key: string, comment?: string): Promise<Shortcut> {
  return bindShortcut(key, comment, false);
}

async function removePrimaryShortcut(shortcut: Shortcut, including?: boolean): Promise<void> {
  await backend.unbindShortcut(shortcut.id, including);
  await syncAllShortcuts();

  if (api.activeTab && common.isUrlEquivalent(api.activeTab.url, shortcut.url)) {
    updatePopupIcon(false);
  }
}

async function removeSecondaryShortcut(shortcut: Shortcut): Promise<void> {
  await backend.unbindShortcut(shortcut.id);
  await syncAllShortcuts();
}

export default api;
