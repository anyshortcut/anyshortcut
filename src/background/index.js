// Service worker entry (MV3).
// Importing these modules registers all event listeners synchronously,
// which is required for a service worker to receive events after restart.
import './tabs.js';
import './message.js';
import injector from './injector.js';
import common from '../common.js';
import { ready } from './state.js';

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
    if (details.previousVersion < '1.9.0') {
      chrome.tabs.create({ url: chrome.runtime.getURL('tour.html') });
    }
  }
});

// Hydrate state eagerly on every service worker start.
ready();
