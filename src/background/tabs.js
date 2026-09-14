// Tab & window tracking, popup icon state and keyboard commands.
// Ported from the MV2 background page: window globals became module state,
// chrome.browserAction became chrome.action, and DOM-based URL parsing
// became new URL() since a service worker has no document.
import common from '../common.js';
import webext from '../webext.js';
import state, { ready } from './state.js';

/**
 * A object contain recent tab ids in each window, persisted to
 * chrome.storage.session so it survives service worker restarts.
 */
let windowRecentTabIds = {};

const RECENT_TABS_KEY = 'anyshortcut_recent_tab_ids';
// Firefox < 115 has no storage.session; fall back to local.
const sessionStore = webext.storage.session || webext.storage.local;

const recentTabsRestored = sessionStore.get(RECENT_TABS_KEY).then((result) => {
  windowRecentTabIds = result[RECENT_TABS_KEY] || {};
});

function persistRecentTabs() {
  sessionStore.set({ [RECENT_TABS_KEY]: windowRecentTabIds });
}

chrome.tabs.onActivated.addListener(onTabActivated);
chrome.tabs.onUpdated.addListener(onTabUpdated);
chrome.tabs.onDetached.addListener(onTabDetached);
chrome.tabs.onRemoved.addListener(onTabRemoved);
chrome.windows.onFocusChanged.addListener(onWindowFocusChanged);
chrome.windows.onRemoved.addListener(onWindowRemoved);
chrome.commands.onCommand.addListener(onCommandFired);

/**
 * Query shortcut key according to the url.
 *@param url the url to query shortcut
 *@return the key if the url was bound,null otherwise
 */
function queryShortcutKeyByUrl(url) {
  let result = queryBindInfoByUrl(url);
  return result ? result.key : null;
}

/**Query the bind info key/value object by url.
 *
 * @param url
 * @returns the bind info. {"key":key,"value":value}
 */
function queryBindInfoByUrl(url) {
  for (let key in state.primaryShortcuts) {
    if (Object.prototype.hasOwnProperty.call(state.primaryShortcuts, key)) {
      let info = state.primaryShortcuts[key];
      if (common.isUrlEquivalent(url, info.url)) {
        return { key: key, value: info };
      }
    }
  }
  return null;
}

/**
 * Check current tab url whether bound or not.
 *@param url current tab url
 *@return boolean true if the url was bound,false otherwise
 */
function checkUrlBound(url) {
  return queryShortcutKeyByUrl(url) !== null;
}

export function isActiveTabUrlSupported() {
  if (state.activeTab && state.activeTab.url) {
    try {
      return ['http:', 'https:', 'file:'].includes(new URL(state.activeTab.url).protocol);
    } catch (error) {
      return false;
    }
  }
  return true;
}

/**
 * Set a different popup icon according to current tab url whether bound or not.
 *@param bound whether the current tab url was bound with a shortcut
 */
export function setPopupIcon(bound) {
  if (!isActiveTabUrlSupported()) {
    // Set a gray unsupported icon
    chrome.action.setIcon({
      path: {
        16: 'icon/icon32-gray-unsupported.png',
      },
    });
    return;
  }

  const icon = bound
    ? {
        path: {
          16: 'icon/icon32.png',
        },
      }
    : {
        path: {
          16: 'icon/icon32-gray.png',
        },
      };
  chrome.action.setIcon(icon);
}

function handleOnTabInfoUpdate(url) {
  setPopupIcon(url ? checkUrlBound(url) : false);
}

/**
 * A callback function to detect tab activated change.
 *@param activeInfo looks like this {integer:tabId,integer:windowId}
 */
async function onTabActivated(activeInfo) {
  await ready();
  //Get current activated tab
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (chrome.runtime.lastError || !tab) return;

    getRecentTabs((recentTabIds) => {
      // Remove previous existed one from recent tab id array.
      let index = recentTabIds.indexOf(tab.id);
      if (index !== -1) {
        recentTabIds.splice(index, 1);
      }
      recentTabIds.push(tab.id);
      persistRecentTabs();
    });

    state.activeTab = tab;

    handleOnTabInfoUpdate(tab.url);
  });
}

/**
 * A callback function to detect current activated tab updated.
 *@param changeInfo looks like this {string:url,string:status...}
 *@param tab Gives the state of the tab that was updated.
 */
async function onTabUpdated(tabId, changeInfo, tab) {
  await ready();
  // Only update activeTab info when state.activeTab.id === tab.id
  if (state.activeTab && state.activeTab.id === tab.id) {
    state.activeTab = tab;
  }
  handleOnTabInfoUpdate(tab.url);
}

/**
 * Fired when a tab is detached from a window,
 * for example because it was moved between windows.
 *@param tabId
 *@param detachInfo looks like this {integer:oldWindowId,integer:oldPosition}
 */
async function onTabDetached(tabId, detachInfo) {
  await recentTabsRestored;
  let tabIds = windowRecentTabIds[detachInfo.oldWindowId];
  if (!tabIds) return;
  let index = tabIds.indexOf(tabId);
  if (index !== -1) {
    tabIds.splice(index, 1);
    persistRecentTabs();
  }
}

/**
 * A callback function to detect current tab been removed or closed.
 *@param tabId
 *@param removeInfo looks like this {integer:windowId,boolean:isWindowClosing}
 */
function onTabRemoved(tabId) {
  getRecentTabs((recentTabIds) => {
    // Remove from recent tab id array.
    let index = recentTabIds.indexOf(tabId);
    if (index !== -1) {
      recentTabIds.splice(index, 1);
      persistRecentTabs();
    }
  });
}

/**
 * Fired when the currently focused window changes.
 * Will be chrome.windows.WINDOW_ID_NONE if all chrome windows have lost focus.
 *@param windowId  ID of the newly focused window.
 */
async function onWindowFocusChanged(windowId) {
  if (chrome.windows.WINDOW_ID_NONE === windowId) {
    return;
  }

  await ready();
  //Get new active tab when window focus changed.
  common.getCurrentTab((tab) => {
    if (tab) {
      state.activeTab = tab;
    }
  });
}

/**
 * A callback function to detect current window been removed or closed.
 *@param windowId ID of the removed window.
 */
async function onWindowRemoved(windowId) {
  await recentTabsRestored;
  delete windowRecentTabIds[windowId];
  persistRecentTabs();
}

async function onCommandFired(command) {
  await ready();
  if (command === 'toggle_recent_tab') {
    getRecentTabs((recentTabIds) => {
      toggleToRecentTab(recentTabIds);
    });
  } else if (command === 'jump_to_home') {
    //TrickTips: Navigate to current tab href origin url or domain url.
    let tab = state.activeTab;
    if (tab && tab.url) {
      let url;
      try {
        url = new URL(tab.url);
      } catch (error) {
        return;
      }
      if (['http:', 'https:'].indexOf(url.protocol) === -1) {
        return;
      }

      let properties = {};
      //Pathname default is '/',search default is ''
      if (url.search !== '' || url.hash !== '') {
        properties['url'] = url.origin + url.pathname;
      } else if (url.pathname !== '/') {
        //Navigate to origin url
        properties['url'] = url.origin;
      } else {
        //Navigate to domain url
        let parts = url.hostname.split('.');
        if (parts.length >= 3) {
          parts.splice(0, parts.length - 2, 'www');
        }
        properties['url'] = url.protocol + '//' + parts.join('.');
      }
      chrome.tabs.update(tab.id, properties);
    }
  }
}

function initializeWindowRecentTabs(windowId, callback) {
  // Initialize empty recent tab array for new window.
  let tabIds = [];
  windowRecentTabIds[windowId] = tabIds;
  callback && callback(tabIds);
}

/**
 * Get recent tabs of current window.
 * @param callback  function looks like this: function(recentTabIds){},
 *                  Note:recentTabIds would be empty array.
 */
function getRecentTabs(callback) {
  chrome.windows.getCurrent((window) => {
    recentTabsRestored.then(() => {
      let key = window.id.toString();
      let recentTabIds = windowRecentTabIds[key];
      if (recentTabIds) {
        callback && callback(recentTabIds);
      } else {
        //Not exist,initialize the new window recent tabs data then make callback.
        initializeWindowRecentTabs(key, callback);
      }
    });
  });
}

/**
 * Toggle recent two tabs.
 * @param recentTabIds  recent tab id array.
 */
function toggleToRecentTab(recentTabIds) {
  let nextTabId;
  let lastIndex = recentTabIds.length - 1;
  for (let i = lastIndex; i >= 0; i--) {
    nextTabId = recentTabIds[i];
    if (!state.activeTab || nextTabId !== state.activeTab.id) {
      // Swap last two elements position.
      let lastTabId = recentTabIds[lastIndex];
      recentTabIds[lastIndex] = recentTabIds[lastIndex - 1];
      recentTabIds[lastIndex - 1] = lastTabId;
      persistRecentTabs();
      break;
    }
  }

  chrome.tabs.update(
    nextTabId,
    {
      active: true,
    },
    () => {
      // Invalid tab, try next one
      if (chrome.runtime.lastError && recentTabIds.length) {
        console.warn(chrome.runtime.lastError);
        toggleToRecentTab(recentTabIds);
      }
    }
  );
}
