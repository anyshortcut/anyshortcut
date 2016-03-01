/**
 * Get the current tab.
 *
 * @param {function(tab)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTab(callback) {
    // Query filter to be passed to chrome.tabs.query - see
    // https://developer.chrome.com/extensions/tabs#method-query
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, tabs => {
        // chrome.tabs.query invokes the callback with a list of tabs that match the
        // query. When the popup is opened, there is certainly a window and at least
        // one tab, so we can safely assume that |tabs| is a non-empty array.
        // A window can only have one active tab at a time, so the array consists of
        // exactly one tab.
        var tab = tabs[0];
        callback(tab);
    });
}

var tlds = ['com', 'org', 'net', 'edu', 'gov'];
/**
 * Extract the domain name from the hostname.
 * Only support five original top-level domains (.com,.org,.net,.edu.gov)
 * @param hostname
 * @return the domain name,otherwise null if the tld not including in tlds arrays.
 */
function extractDomainName(hostname) {
    var parts = hostname.split('.');
    if (parts.length < 2) {
        return null;
    }

    var tld = parts[parts.length - 1];
    if (tlds.indexOf(tld) === -1) {
        return null;
    }

    parts.splice(0, parts.length - 2);
    return parts.join('.');
}

/**
 * Remove trail slash.
 */
function trimTrailSlash(str) {
    return str.replace(/\/$/, '');
}
