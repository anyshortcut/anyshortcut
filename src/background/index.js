// Service worker entry (MV3).
// Importing these modules registers all event listeners synchronously,
// which is required for a service worker to receive events after restart.
import './tabs.js';
import './message.js';
import injector from './injector.js';
import common from '../common.js';
import { ready } from './state.js';

/**
 * Compare dotted version strings numerically.
 *
 * Comparing them as strings is wrong once a part reaches two digits:
 * '1.11.1' < '1.9.0' is true lexicographically.
 *
 * @returns true when version is older than target.
 */
function isVersionBelow(version, target) {
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
