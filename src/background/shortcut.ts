// Shortcut lookups over the hydrated background state.
// Binding/unbinding happens in the popup (see src/extension-api.ts);
// the background only reads shortcuts to answer content-script messages.
import storage from '../storage';
import common from '../common';
import prefs from '../prefs';
import state from './state';
import type { DomainShortcuts, Shortcut } from '../types';

/**
 * Get bound domain from secondary shortcuts by hostname.
 */
export function getBoundDomainByHostname(hostname: string): string | null {
  for (const domain of Object.keys(state.secondaryShortcuts)) {
    if (common.isHostnameEndsWithDomain(hostname, domain)) {
      return domain;
    }
  }
  return null;
}

export function openShortcut(shortcut: Pick<Shortcut, 'id' | 'url'> | null): void {
  if (!shortcut) return;

  if (prefs.isShortcutOpenByBlank() || !state.activeTab || state.activeTab.id === undefined) {
    chrome.tabs.create({ url: shortcut.url });
  } else {
    chrome.tabs.update(state.activeTab.id, { url: shortcut.url });
  }

  // The storage.onChanged listener in state.ts refreshes the in-memory copy.
  storage.increaseShortcutOpenTimes(shortcut.id).catch((error) => {
    console.log(error);
  });
}

export function getPrimaryShortcut(key: string): Shortcut | null {
  return state.primaryShortcuts[key] || null;
}

export function getPrimaryShortcutByDomain(domain: string): Shortcut | null {
  for (const shortcut of Object.values(state.primaryShortcuts)) {
    if (shortcut.domain === domain) {
      return shortcut;
    }
  }
  return null;
}

export function getSecondaryShortcut(hostname: string, key: string): Shortcut | null {
  const domain = getBoundDomainByHostname(hostname);
  if (domain) {
    return state.secondaryShortcuts[domain][key] || null;
  }
  // Not bound any key for this domain name yet
  return null;
}

export function getSecondaryShortcutQuickly(
  primaryKey: string,
  secondaryKey: string
): Shortcut | null {
  const primaryShortcut = state.primaryShortcuts[primaryKey];
  if (primaryShortcut) {
    const shortcuts = state.secondaryShortcuts[primaryShortcut.domain];
    if (shortcuts && shortcuts[secondaryKey]) {
      return shortcuts[secondaryKey];
    }
  }
  return null;
}

export function getSecondaryShortcutsByUrl(url: string): DomainShortcuts {
  // Only return the domain specific secondary shortcuts by url.
  const hostname = common.getHostnameFromUrl(url);
  const domain = getBoundDomainByHostname(hostname);
  return domain ? state.secondaryShortcuts[domain] : {};
}

export function getSecondaryShortcutsByPrimaryKey(primaryKey: string): DomainShortcuts {
  const primaryShortcut = state.primaryShortcuts[primaryKey];
  if (primaryShortcut) {
    return state.secondaryShortcuts[primaryShortcut.domain] || {};
  }
  return {};
}
