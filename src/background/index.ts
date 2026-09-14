// Service worker entry (MV3).
// Importing these modules registers all event listeners synchronously,
// which is required for a service worker to receive events after restart.
import './tabs';
import './message';
import injector from './injector';
import common from '../common';
import { ready } from './state';

/**
 * Compare dotted version strings numerically.
 *
 * Comparing them as strings is wrong once a part reaches two digits:
 * '1.11.1' < '1.9.0' is true lexicographically.
 *
 * @returns true when version is older than target.
 */
function isVersionBelow(version: string, target: string): boolean {
  const parts = version.split('.').map(Number);
  const targetParts = target.split('.').map(Number);
  for (let i = 0; i < Math.max(parts.length, targetParts.length); i++) {
    const part = parts[i] || 0;
    const targetPart = targetParts[i] || 0;
    if (part !== targetPart) return part < targetPart;
  }
  return false;
}

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    common.iterateAllWindowTabs((tabId) => {
      injector.injectTabContentScriptManually(tabId);
    });
    chrome.tabs.create({ url: chrome.runtime.getURL('tour.html') });
  } else if (details.reason === 'update') {
    common.iterateAllWindowTabs((tabId) => {
      injector.injectTabContentScriptManually(tabId);
    });

    console.log('previous version', details.previousVersion);
    if (details.previousVersion && isVersionBelow(details.previousVersion, '1.9.0')) {
      chrome.tabs.create({ url: chrome.runtime.getURL('tour.html') });
    }
  }
});

// Hydrate state eagerly on every service worker start.
ready();
