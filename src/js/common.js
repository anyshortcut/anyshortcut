export default {
    /**
     * Get the current tab.
     *
     * @param {function(tab)} callback - called when the URL of the current tab
     *   is found.
     */
    getCurrentTab(callback) {
        // Query filter to be passed to chrome.tabs.query - see
        // https://developer.chrome.com/extensions/tabs#method-query
        let queryInfo = {
            active: true,
            currentWindow: true,
            windowType: 'normal'
        };

        chrome.tabs.query(queryInfo, tabs => {
            // chrome.tabs.query invokes the callback with a list of tabs that match the
            // query. When the popup is opened, there is certainly a window and at least
            // one tab, so we can safely assume that |tabs| is a non-empty array.
            // A window can only have one active tab at a time, so the array consists of
            // exactly one tab.
            let tab = tabs[0];
            callback(tab);
        });
    },
    /***
     *
     * @param {function(tab.id)} callback
     */
    iterateAllWindowTabs(callback) {
        chrome.windows.getAll({populate: true, windowTypes: ['normal']}, windows => {
            windows.forEach(window => {
                window.tabs.filter(tab => {
                    return !tab.url.startsWith('https://chrome.google.com');
                }).forEach(tab => {
                    callback(tab.id);
                });
            });
        });
    },
    isUrlEquivalent(url1, url2) {
        //Check slash ignore equality, ignore url schema equality.
        return trimTrailSlash(stripUrlSchema(url1)) === trimTrailSlash(stripUrlSchema(url2));
    },
    isUrlEndsWithDomain(url, domain) {
        let hostname = this.getHostnameFromUrl(url);
        return this.isHostnameEndsWithDomain(hostname, domain);
    },
    getHostnameFromUrl(url) {
        return new URL(url).hostname;
    },
    isHostnameEndsWithDomain(hostname, domain) {
        return hostname.endsWith(`.${domain}`) || hostname === domain;
    },
    openPopupWindow(url) {
        let width = 450, height = 600;
        let screenLeft = window.screenLeft ? window.screenLeft : screen.left,
            screenTop = window.screenTop ? window.screenTop : screen.top,
            innerWidth = window.innerWidth,
            innerHeight = window.innerHeight,
            left = parseInt(innerWidth / 2 - width / 2 + screenLeft),
            top = parseInt(innerHeight / 2 - height / 2 + screenTop);
        let windowFeatures = `width=${width},height=${height},top=${top},left=${left},
        resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=no`;
        let authWindow = window.open(url, 'AnyShortcut', windowFeatures);
        authWindow && authWindow.focus && authWindow.focus();
    }
}

/**
 * Remove trail slash.
 */
function trimTrailSlash(url) {
    return url ? url.replace(/\/$/, '') : '';
}

function stripUrlSchema(url) {
    if (url && url.includes('://')) {
        return url.split('://')[1]
    }

    return url;
}