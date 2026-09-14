// Shortcut lookups over the hydrated background state.
// Binding/unbinding happens in the popup (see src/extension-api.js);
// the background only reads shortcuts to answer content-script messages.
import storage from '../storage.js';
import common from '../common.js';
import prefs from '../prefs.js';
import state from './state.js';

/**
 * Get bound domain from secondary shortcuts by hostname.
 */
export function getBoundDomainByHostname(hostname) {
  for (const domain of Object.keys(state.secondaryShortcuts)) {
    if (common.isHostnameEndsWithDomain(hostname, domain)) {
      return domain;
    }
  }
  return null;
}

export function openShortcut(shortcut) {
  if (!shortcut) return;

  if (prefs.isShortcutOpenByBlank() || !state.activeTab) {
    chrome.tabs.create({ url: shortcut.url });
  } else {
    chrome.tabs.update(state.activeTab.id, { url: shortcut.url });
  }

  // The storage.onChanged listener in state.js refreshes the in-memory copy.
  storage.increaseShortcutOpenTimes(shortcut.id).catch((error) => {
    console.log(error);
  });
}

export function getPrimaryShortcut(key) {
  return state.primaryShortcuts[key] || null;
}

export function getPrimaryShortcutByDomain(domain) {
  for (const shortcut of Object.values(state.primaryShortcuts)) {
    if (shortcut.domain === domain) {
      return shortcut;
    }
  }
  return null;
}

export function getSecondaryShortcut(hostname, key) {
  const domain = getBoundDomainByHostname(hostname);
  if (domain) {
    return state.secondaryShortcuts[domain][key] || null;
  }
  // Not bound any key for this domain name yet
  return null;
}

export function getSecondaryShortcutQuickly(primaryKey, secondaryKey) {
  const primaryShortcut = state.primaryShortcuts[primaryKey];
  if (primaryShortcut) {
    const shortcuts = state.secondaryShortcuts[primaryShortcut.domain];
    if (shortcuts && shortcuts[secondaryKey]) {
      return shortcuts[secondaryKey];
    }
  }
  return null;
}

export function getSecondaryShortcutsByUrl(url) {
  // Only return the domain specific secondary shortcuts by url.
  const hostname = common.getHostnameFromUrl(url);
  const domain = getBoundDomainByHostname(hostname);
  return domain ? state.secondaryShortcuts[domain] : {};
}

export function getSecondaryShortcutsByPrimaryKey(primaryKey) {
  const primaryShortcut = state.primaryShortcuts[primaryKey];
  if (primaryShortcut) {
    return state.secondaryShortcuts[primaryShortcut.domain] || {};
  }
  return {};
}
