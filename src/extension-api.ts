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
import storage from './storage';
import common from './common';
import prefs from './prefs';
import webext from './webext';
import type {
  BindSuccessMessage,
  DomainShortcuts,
  PrimaryShortcuts,
  SecondaryShortcuts,
  Shortcut,
} from './types';

const DEFAULT_FAVICON = chrome.runtime.getURL('icon/default_favicon.svg');
const BIND_TIMES_KEY = 'anyshortcut_bind_success_times';

export interface ExtensionApi {
  activeTab: chrome.tabs.Tab | null;
  platformOs: string | null;
  authenticated: boolean;
  subscriptionStatus: string;
  subscriptionEndAt: string | null;
  primaryShortcuts: PrimaryShortcuts;
  secondaryShortcuts: SecondaryShortcuts;
  init(): Promise<ExtensionApi>;
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
  subscriptionStatus: 'active',
  subscriptionEndAt: null,
  primaryShortcuts: {},
  secondaryShortcuts: {},
  init,
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
    prefs.init(),
    syncAllShortcuts(),
  ]);
  api.activeTab = tabs[0] || null;
  api.platformOs = platformInfo.os;
  return api;
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
  // Always active in offline mode.
  return false;
}

async function syncAllShortcuts(): Promise<void> {
  const { primary, secondary } = await storage.getAllShortcuts();
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

  const shortcut = await storage.bindShortcut({
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
  await storage.unbindShortcut(shortcut.id, including);
  await syncAllShortcuts();

  if (api.activeTab && common.isUrlEquivalent(api.activeTab.url, shortcut.url)) {
    updatePopupIcon(false);
  }
}

async function removeSecondaryShortcut(shortcut: Shortcut): Promise<void> {
  await storage.unbindShortcut(shortcut.id);
  await syncAllShortcuts();
}

export default api;
