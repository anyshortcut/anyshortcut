// Tab & window tracking, popup icon state and keyboard commands.
// Ported from the MV2 background page: window globals became module state,
// chrome.browserAction became chrome.action, and DOM-based URL parsing
// became new URL() since a service worker has no document.
import common from '../common';
import webext from '../webext';
import state, { ready } from './state';

/**
 * A object contain recent tab ids in each window, persisted to
 * chrome.storage.session so it survives service worker restarts.
 */
let windowRecentTabIds: Record<string, number[]> = {};

const RECENT_TABS_KEY = 'anyshortcut_recent_tab_ids';
// Firefox < 115 has no storage.session; fall back to local.
const sessionStore = webext.storage.session || webext.storage.local;

const recentTabsRestored = sessionStore.get(RECENT_TABS_KEY).then((result) => {
  windowRecentTabIds = (result[RECENT_TABS_KEY] as Record<string, number[]> | undefined) || {};
});

function persistRecentTabs(): void {
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
function queryShortcutKeyByUrl(url: string): string | null {
  const result = queryBindInfoByUrl(url);
  return result ? result.key : null;
}

/**
 * Query the bind info key/value object by url.
 */
function queryBindInfoByUrl(url: string) {
  for (const [key, info] of Object.entries(state.primaryShortcuts)) {
    if (common.isUrlEquivalent(url, info.url)) {
      return { key: key, value: info };
    }
  }
  return null;
}

/**
 * Check current tab url whether bound or not.
 */
function checkUrlBound(url: string): boolean {
  return queryShortcutKeyByUrl(url) !== null;
}

export function isActiveTabUrlSupported(): boolean {
  if (state.activeTab && state.activeTab.url) {
    try {
      return ['http:', 'https:', 'file:'].includes(new URL(state.activeTab.url).protocol);
    } catch {
      return false;
    }
  }
  return true;
}

/**
 * Set a different popup icon according to current tab url whether bound or not.
 *@param bound whether the current tab url was bound with a shortcut
 */
export function setPopupIcon(bound: boolean): void {
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

function handleOnTabInfoUpdate(url: string | undefined): void {
  setPopupIcon(url ? checkUrlBound(url) : false);
}

/**
 * A callback function to detect tab activated change.
 */
async function onTabActivated(activeInfo: chrome.tabs.OnActivatedInfo): Promise<void> {
  await ready();
  //Get current activated tab
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (chrome.runtime.lastError || !tab || tab.id === undefined) return;
    const tabId = tab.id;

    getRecentTabs((recentTabIds) => {
      // Remove previous existed one from recent tab id array.
      const index = recentTabIds.indexOf(tabId);
      if (index !== -1) {
        recentTabIds.splice(index, 1);
      }
      recentTabIds.push(tabId);
      persistRecentTabs();
    });

    state.activeTab = tab;

    handleOnTabInfoUpdate(tab.url);
  });
}

/**
 * A callback function to detect current activated tab updated.
 */
async function onTabUpdated(
  tabId: number,
  changeInfo: chrome.tabs.OnUpdatedInfo,
  tab: chrome.tabs.Tab
): Promise<void> {
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
 */
async function onTabDetached(tabId: number, detachInfo: chrome.tabs.OnDetachedInfo): Promise<void> {
  await recentTabsRestored;
  const tabIds = windowRecentTabIds[detachInfo.oldWindowId];
  if (!tabIds) return;
  const index = tabIds.indexOf(tabId);
  if (index !== -1) {
    tabIds.splice(index, 1);
    persistRecentTabs();
  }
}

/**
 * A callback function to detect current tab been removed or closed.
 */
function onTabRemoved(tabId: number): void {
  getRecentTabs((recentTabIds) => {
    // Remove from recent tab id array.
    const index = recentTabIds.indexOf(tabId);
    if (index !== -1) {
      recentTabIds.splice(index, 1);
      persistRecentTabs();
    }
  });
}

/**
 * Fired when the currently focused window changes.
 * Will be chrome.windows.WINDOW_ID_NONE if all chrome windows have lost focus.
 */
async function onWindowFocusChanged(windowId: number): Promise<void> {
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
 */
async function onWindowRemoved(windowId: number): Promise<void> {
  await recentTabsRestored;
  delete windowRecentTabIds[windowId];
  persistRecentTabs();
}

async function onCommandFired(command: string): Promise<void> {
  await ready();
  if (command === 'toggle_recent_tab') {
    getRecentTabs((recentTabIds) => {
      toggleToRecentTab(recentTabIds);
    });
  } else if (command === 'jump_to_home') {
    //TrickTips: Navigate to current tab href origin url or domain url.
    const tab = state.activeTab;
    if (tab && tab.url && tab.id !== undefined) {
      let url: URL;
      try {
        url = new URL(tab.url);
      } catch {
        return;
      }
      if (['http:', 'https:'].indexOf(url.protocol) === -1) {
        return;
      }

      const properties: chrome.tabs.UpdateProperties = {};
      //Pathname default is '/',search default is ''
      if (url.search !== '' || url.hash !== '') {
        properties.url = url.origin + url.pathname;
      } else if (url.pathname !== '/') {
        //Navigate to origin url
        properties.url = url.origin;
      } else {
        //Navigate to domain url
        const parts = url.hostname.split('.');
        if (parts.length >= 3) {
          parts.splice(0, parts.length - 2, 'www');
        }
        properties.url = url.protocol + '//' + parts.join('.');
      }
      chrome.tabs.update(tab.id, properties);
    }
  }
}

function initializeWindowRecentTabs(windowId: string, callback?: (tabIds: number[]) => void): void {
  // Initialize empty recent tab array for new window.
  const tabIds: number[] = [];
  windowRecentTabIds[windowId] = tabIds;
  callback && callback(tabIds);
}

/**
 * Get recent tabs of current window.
 * Note: recentTabIds may be an empty array.
 */
function getRecentTabs(callback?: (tabIds: number[]) => void): void {
  chrome.windows.getCurrent((window) => {
    recentTabsRestored.then(() => {
      const key = window.id!.toString();
      const recentTabIds = windowRecentTabIds[key];
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
function toggleToRecentTab(recentTabIds: number[]): void {
  let nextTabId: number | undefined;
  const lastIndex = recentTabIds.length - 1;
  for (let i = lastIndex; i >= 0; i--) {
    nextTabId = recentTabIds[i];
    if (!state.activeTab || nextTabId !== state.activeTab.id) {
      // Swap last two elements position.
      const lastTabId = recentTabIds[lastIndex];
      recentTabIds[lastIndex] = recentTabIds[lastIndex - 1];
      recentTabIds[lastIndex - 1] = lastTabId;
      persistRecentTabs();
      break;
    }
  }
  if (nextTabId === undefined) return;

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
