import injector from './injector.js';
import common from '../common.js';
import storage from '../storage.js';

// Initialize extension state
window.authenticated = true; // Always authenticated in offline mode
window.primaryShortcuts = {};
window.secondaryShortcuts = {};

// Load shortcuts from storage on startup
loadShortcutsFromStorage();

chrome.runtime.onInstalled.addListener((installReason, previousVersion) => {
  if (installReason.reason === 'install') {
    common.iterateAllWindowTabs((tabId) => {
      injector.injectTabContentScriptManually(tabId);
    });
    chrome.tabs.create({ url: chrome.runtime.getURL('tour.html') });
  } else if (installReason.reason === 'update') {
    common.iterateAllWindowTabs((tabId) => {
      injector.injectTabContentScriptManually(tabId);
    });

    console.log('previous version', previousVersion);
    if (previousVersion < '1.9.0') {
      chrome.tabs.create({ url: chrome.runtime.getURL('tour.html') });
    }
  }
});

chrome.runtime.getPlatformInfo((platformInfo) => {
  window.platformOs = platformInfo.os;
});

// Load shortcuts from storage into global variables
async function loadShortcutsFromStorage() {
  try {
    const shortcuts = await storage.getAllShortcuts();
    window.primaryShortcuts = shortcuts.primary || {};
    window.secondaryShortcuts = shortcuts.secondary || {};
  } catch (error) {
    console.error('Failed to load shortcuts from storage:', error);
  }
}

// Sync shortcuts back to storage
async function syncShortcutsToStorage() {
  try {
    await storage.set(storage.STORAGE_KEYS.PRIMARY_SHORTCUTS, window.primaryShortcuts);
    await storage.set(storage.STORAGE_KEYS.SECONDARY_SHORTCUTS, window.secondaryShortcuts);
  } catch (error) {
    console.error('Failed to sync shortcuts to storage:', error);
  }
}

// Export sync function for use by other background scripts
window.syncAllShortcuts = loadShortcutsFromStorage;

// Add required global functions for extension functionality
window.isActiveTabUrlSupported = function() {
  if (!window.activeTab) return false;
  const url = window.activeTab.url;
  return url && (url.startsWith('http://') || url.startsWith('https://'));
};

window.setPopupIcon = function() {
  // Set extension icon (placeholder function)
  // In a real implementation, this might change the icon based on state
};

window.subscriptionStatus = 'active'; // Always active in offline mode
window.subscriptionEndAt = null;
