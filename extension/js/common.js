export default {
    /**
     * Get the current tab.
     *
     * @param {function(tab)} callback - called when the URL of the current tab
     *   is found.
     */
    getCurrentTab(callback)
    {
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

    tlds: ['com', 'org', 'net', 'edu', 'gov'],
    /**
     * Extract the domain name from the hostname.
     * Only support five original top-level domains (.com,.org,.net,.edu.gov)
     * @param hostname
     * @return string the domain name
     * @return null  if the tld not including in tlds arrays
     */
    extractDomainName(hostname){
        let parts = hostname.split('.');
        if (parts.length < 2) {
            return null;
        }

        let tld = parts[parts.length - 1];
        if (this.tlds.indexOf(tld) === -1) {
            return null;
        }

        parts.splice(0, parts.length - 2);
        return parts.join('.');
    },
    isUrlEquivalent(url1, url2){
        //Check slash ignore equality, ignore url schema equality.
        return trimTrailSlash(stripUrlSchema(url1)) === trimTrailSlash(stripUrlSchema(url2));
    },
    getHostnameFromUrl(url){
        let a = document.createElement('a');
        a.href = url;
        return a.hostname;
    },
}
/**
 * Remove trail slash.
 */
function trimTrailSlash(url) {
    return url.replace(/\/$/, '');
}

function stripUrlSchema(url) {
    return url.split('://')[1]
}