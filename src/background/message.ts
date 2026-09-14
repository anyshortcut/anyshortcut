// Content-script message handling.
// The extension is offline-first: no authentication or subscription
// checks remain, everything answers from local state.
import prefs from '../prefs';
import common from '../common';
import state, { ready } from './state';
import {
  getBoundDomainByHostname,
  getPrimaryShortcut,
  getSecondaryShortcut,
  getSecondaryShortcutQuickly,
  getSecondaryShortcutsByPrimaryKey,
  getSecondaryShortcutsByUrl,
  openShortcut,
} from './shortcut';
import type { BackgroundRequest } from '../types';

function isSecondaryShortcutActivatedUrl(url: string): boolean {
  const hostname = common.getHostnameFromUrl(url);
  const domain = getBoundDomainByHostname(hostname);
  return Boolean(domain && Object.keys(state.secondaryShortcuts[domain]).length > 0);
}

/**
 * Check whether have secondary shortcuts or primary shortcuts have compound shortcut.
 *
 * @returns true if should delay, false otherwise
 */
function determineDelay(): boolean {
  return (
    Object.keys(state.secondaryShortcuts).length > 0 ||
    Object.keys(state.primaryShortcuts).some((key) => key.length === 2)
  );
}

async function handleMessage(
  message: BackgroundRequest,
  sender: chrome.runtime.MessageSender
): Promise<unknown> {
  await ready();
  console.log('message:', message);

  if (message.info) {
    let showCircle = false;
    const config = prefs.getShowCircleConfig();
    if (config === 'always') {
      showCircle = true;
    } else if (config === 'never') {
      showCircle = false;
    } else if (config === 'only') {
      showCircle = isSecondaryShortcutActivatedUrl(message.url!);
    }

    return {
      showCircle: showCircle,
      // Whether trigger primary shortcut delay
      delay: determineDelay(),
    };
  } else if (message.jumpSecondary) {
    // Get the secondary shortcut according to the domain url and secondary key.
    const shortcut = getSecondaryShortcut(common.getHostnameFromUrl(message.url!), message.key!);
    if (shortcut) {
      const tabId = sender.tab ? sender.tab.id : state.activeTab?.id;
      if (tabId !== undefined) {
        chrome.tabs.update(tabId, { url: shortcut.url });
      }
    }
    return undefined;
  }

  const combinationKey = prefs.getDefaultCombinationKey();
  switch (true) {
    case Boolean(message.request): {
      if (message.modifier !== combinationKey) {
        return { wrongModifier: true };
      }

      const shortcut = getPrimaryShortcut(message.key!);
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

      const primaryShortcut = getPrimaryShortcut(message.firstKey! + message.secondKey!);
      const secondaryShortcut = getSecondaryShortcutQuickly(message.firstKey!, message.secondKey!);
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
      openShortcut({ url: message.url!, id: message.shortcutId! });
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

chrome.runtime.onMessage.addListener((message: BackgroundRequest, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(sendResponse)
    .catch((error) => {
      console.error('Failed to handle message:', message, error);
      sendResponse(undefined);
    });
  // Keep the message channel open for the async response.
  return true;
});
