// Content-script message handling.
// The extension is offline-first: no authentication or subscription
// checks remain, everything answers from local state.
import prefs from '../prefs.js';
import common from '../common.js';
import state, { ready } from './state.js';
import {
  getBoundDomainByHostname,
  getPrimaryShortcut,
  getSecondaryShortcut,
  getSecondaryShortcutQuickly,
  getSecondaryShortcutsByPrimaryKey,
  getSecondaryShortcutsByUrl,
  openShortcut,
} from './shortcut.js';

function isSecondaryShortcutActivatedUrl(url) {
  let hostname = common.getHostnameFromUrl(url);
  let domain = getBoundDomainByHostname(hostname);
  return domain && Object.keys(state.secondaryShortcuts[domain]).length > 0;
}

/**
 * Check whether have secondary shortcuts or primary shortcuts have compound shortcut.
 *
 * @returns {boolean} true if should delay, false otherwise
 */
function determineDelay() {
  return (
    Object.keys(state.secondaryShortcuts).length > 0 ||
    Object.keys(state.primaryShortcuts).some((key) => key.length === 2)
  );
}

async function handleMessage(message, sender) {
  await ready();
  console.log('message:', message);

  if (message.info) {
    let showCircle = false;
    let config = prefs.getShowCircleConfig();
    if (config === 'always') {
      showCircle = true;
    } else if (config === 'never') {
      showCircle = false;
    } else if (config === 'only') {
      showCircle = isSecondaryShortcutActivatedUrl(message.url);
    }

    return {
      showCircle: showCircle,
      // Whether trigger primary shortcut delay
      delay: determineDelay(),
    };
  } else if (message.jumpSecondary) {
    // Get the secondary shortcut according to the domain url and secondary key.
    let shortcut = getSecondaryShortcut(common.getHostnameFromUrl(message.url), message.key);
    if (shortcut) {
      let tabId = sender.tab ? sender.tab.id : state.activeTab && state.activeTab.id;
      if (tabId) {
        chrome.tabs.update(tabId, { url: shortcut.url });
      }
    }
    return undefined;
  }

  let combinationKey = prefs.getDefaultCombinationKey();
  switch (true) {
    case Boolean(message.request): {
      if (message.modifier !== combinationKey) {
        return { wrongModifier: true };
      }

      let shortcut = getPrimaryShortcut(message.key);
      if (shortcut) {
        openShortcut(shortcut);
        return undefined;
      }
      return { shortcut: null };
    }
    case Boolean(message.query): {
      if (message.modifier !== combinationKey) {
        return { wrongModifier: true };
      }

      let primaryShortcut = getPrimaryShortcut(message.firstKey + message.secondKey);
      let secondaryShortcut = getSecondaryShortcutQuickly(message.firstKey, message.secondKey);
      if (primaryShortcut && secondaryShortcut) {
        return {
          primaryShortcut: primaryShortcut,
          secondaryShortcut: secondaryShortcut,
        };
      } else if (!primaryShortcut && !secondaryShortcut) {
        return {
          primaryShortcut: null,
          secondaryShortcut: null,
        };
      } else {
        openShortcut(primaryShortcut || secondaryShortcut);
        return undefined;
      }
    }
    case Boolean(message.open): {
      openShortcut({ url: message.url, id: message.shortcutId });
      return undefined;
    }
    case Boolean(message.listSecondary): {
      let shortcuts = null;
      if (message.key) {
        shortcuts = getSecondaryShortcutsByPrimaryKey(message.key);
      } else if (message.url) {
        shortcuts = getSecondaryShortcutsByUrl(message.url);
      }

      return { shortcuts: shortcuts };
    }
    default: {
      return undefined;
    }
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(sendResponse)
    .catch((error) => {
      console.error('Failed to handle message:', message, error);
      sendResponse(undefined);
    });
  // Keep the message channel open for the async response.
  return true;
});
