export default {
  /**
   * Get the current tab.
   *
   * @param callback - called with the active tab of the current window
   *   (or undefined when there is none, e.g. only devtools windows open).
   */
  getCurrentTab(callback: (tab: chrome.tabs.Tab | undefined) => void): void {
    // Query filter to be passed to chrome.tabs.query - see
    // https://developer.chrome.com/extensions/tabs#method-query
    const queryInfo: chrome.tabs.QueryInfo = {
      active: true,
      currentWindow: true,
      windowType: 'normal',
    };

    chrome.tabs.query(queryInfo, (tabs) => {
      callback(tabs[0]);
    });
  },
  /**
   * Iterate every tab of every normal window.
   */
  iterateAllWindowTabs(callback: (tabId: number) => void): void {
    chrome.windows.getAll({ populate: true, windowTypes: ['normal'] }, (windows) => {
      windows.forEach((window) => {
        (window.tabs ?? [])
          .filter((tab) => {
            return tab.url && !tab.url.startsWith('https://chrome.google.com');
          })
          .forEach((tab) => {
            if (tab.id !== undefined) {
              callback(tab.id);
            }
          });
      });
    });
  },
  isUrlEquivalent(url1: string | undefined, url2: string | undefined): boolean {
    //Check slash ignore equality, ignore url schema equality.
    return trimTrailSlash(stripUrlSchema(url1)) === trimTrailSlash(stripUrlSchema(url2));
  },
  isUrlEndsWithDomain(url: string, domain: string): boolean {
    return this.isHostnameEndsWithDomain(this.getHostnameFromUrl(url), domain);
  },
  getHostnameFromUrl(url: string): string {
    return new URL(url).hostname;
  },
  isHostnameEndsWithDomain(hostname: string, domain: string): boolean {
    return hostname.endsWith(`.${domain}`) || hostname === domain;
  },
};

/**
 * Remove trail slash.
 */
function trimTrailSlash(url: string | undefined): string {
  return url ? url.replace(/\/$/, '') : '';
}

function stripUrlSchema(url: string | undefined): string | undefined {
  if (url && url.includes('://')) {
    return url.split('://')[1];
  }

  return url;
}
