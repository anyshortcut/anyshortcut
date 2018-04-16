import client from '../client.js';
import common from '../common.js';
import _ from "lodash";

const defaultFaviconUrl = chrome.runtime.getURL('icon/default_favicon.svg');

window.primaryShortcuts = {};
window.secondaryShortcuts = {};

/**
 * Get bound domain from Secondary shortcuts by hostname.
 * @param hostname
 * @returns {*}
 */
window.getBoundDomainByHostname = function(hostname) {
    for (let domain of Object.keys(secondaryShortcuts)) {
        if (secondaryShortcuts.hasOwnProperty(domain)
            && common.isHostnameEndsWithDomain(hostname, domain)) {
            return domain;
        }
    }
    return null;
};

/**
 * Assign nested shortcut into shortcuts.
 * @param shortcuts
 * @param shortcut
 */
window.assignShortcut = function(shortcuts, shortcut) {
    if (!shortcut) return;

    if (shortcut && !shortcut.favicon) {
        shortcut['favicon'] = defaultFaviconUrl;
    }

    const nestedShortcut = {};
    nestedShortcut[shortcut.key] = shortcut;
    Object.assign(shortcuts, nestedShortcut);
};

/**
 * Sync all shortcuts from server.
 */
window.syncAllShortcuts = function(callback) {
    client.getAllShortcuts().then(data => {
        data.primary.forEach(item => {
            Object.assign(primaryShortcuts, item);
        });
        secondaryShortcuts = data.secondary || {};

        // Iterate primary and secondary shortcuts to
        // ensure all shortcut have a default favicon image.
        _.forOwn(primaryShortcuts, shortcut => {
            assignShortcut(primaryShortcuts, shortcut)
        });
        _.forOwn(secondaryShortcuts, domain => {
            _.forOwn(domain, shortcut => {
                assignShortcut(domain, shortcut);
            });
        });

        // Callback if exist
        callback && callback();

        console.log('primary:', primaryShortcuts);
        console.log('secondary:', secondaryShortcuts);
    }).catch(error => {
        console.error(error);
    });
};

window.bindPrimaryShortcut = function(key, comment) {
    let tab = window.activeTab;
    return new Promise((resolve, reject) => {
        client.bindShortcut({
            key: key,
            url: tab.url,
            title: tab.title,
            favicon: tab.favIconUrl,
            comment: comment,
            primary: true,
        }).then(shortcut => {
            assignShortcut(primaryShortcuts, shortcut);
            window.setPopupIcon(true);
            window.notifyActiveTabShortcutBindSuccess(shortcut);

            resolve();
        }).catch(error => {
            console.log(error);
            reject(error);
        });
    });
};

window.removePrimaryShortcut = function(shortcut, including) {
    return new Promise((resolve, reject) => {
        client.unbindShortcut(shortcut.id, including).then(response => {
            if (common.isUrlEquivalent(window.activeTab.url, shortcut.url)) {
                window.setPopupIcon(false);
            }

            delete primaryShortcuts[shortcut.key];

            if (including) {
                // Remove all secondary shortcuts when delete primary shortcut
                delete secondaryShortcuts[shortcut.domain];
            }

            resolve();
        }).catch(error => {
            console.log(error);
            reject(error);
        });
    });
};

window.bindSecondaryShortcut = function(key, comment) {
    let tab = window.activeTab;
    return new Promise((resolve, reject) => {
        client.bindShortcut({
            key: key,
            url: tab.url,
            title: tab.title,
            favicon: tab.favIconUrl,
            comment: comment,
            primary: false,
        }).then(shortcut => {
            let domain = shortcut['domain'];
            if (!secondaryShortcuts.hasOwnProperty(domain)) {
                secondaryShortcuts[domain] = {}
            }
            assignShortcut(secondaryShortcuts[domain], shortcut);

            resolve();
        }).catch(error => {
            console.log(error);
            reject(error);
        });
    });
};

window.removeSecondaryShortcut = function(shortcut) {
    return new Promise((resolve, reject) => {
        client.unbindShortcut(shortcut.id).then(response => {
            let hostname = common.getHostnameFromUrl(shortcut.url);
            let domain = getBoundDomainByHostname(hostname);
            let shortcuts = secondaryShortcuts[domain];
            delete shortcuts[shortcut.key];

            if (_.isEmpty(shortcuts)) {
                // Remove empty secondary shortcut at domain level
                // TODO However, all content script need reload again to work as latest delay result.
                delete secondaryShortcuts[domain];
            }

            resolve();
        }).catch(error => {
            console.log(error);
            reject(error);
        });
    });
};

window.getPrimaryShortcut = function(key) {
    if (primaryShortcuts.hasOwnProperty(key)) {
        return primaryShortcuts[key];
    } else {
        // The shortcut key not bound yet.
        return null;
    }
};

window.getPrimaryShortcutByDomain = function(domain) {
    for (let key of Object.keys(primaryShortcuts)) {
        if (primaryShortcuts.hasOwnProperty(key)
            && primaryShortcuts[key].domain === domain) {
            return primaryShortcuts[key];
        }
    }
    return null;
};

window.getSecondaryShortcut = function(hostname, key) {
    // Access options shortcut key for correct domain.
    let domain = getBoundDomainByHostname(hostname);
    if (domain) {
        let shortcuts = secondaryShortcuts[domain];
        if (shortcuts.hasOwnProperty(key)) {
            return shortcuts[key];
        }
    } else {
        // Not bound any key for this domain name yet or not exist the key
        return null;
    }
};

window.getSecondaryShortcutQuickly = function(primaryKey, secondaryKey) {
    if (primaryShortcuts.hasOwnProperty(primaryKey)) {
        let value = primaryShortcuts[primaryKey];
        let domain = value.domain;

        let shortcuts = secondaryShortcuts[domain];
        if (shortcuts && shortcuts.hasOwnProperty(secondaryKey)) {
            return shortcuts[secondaryKey];
        } else {
            // Not bound any key for this domain name yet or not exist the key
            return null;
        }
    } else {
        // The shortcut key not bound yet.
        return null;
    }
};

window.getSecondaryShortcutsByUrl = function(url) {
    // Only return the domain specific secondary shortcuts by url.
    let hostname = common.getHostnameFromUrl(url);
    let domain = getBoundDomainByHostname(hostname);
    return domain ? secondaryShortcuts[domain] : {};
};

window.getSecondaryShortcutsByPrimaryKey = function(primaryKey) {
    let primaryShortcut = primaryShortcuts[primaryKey];
    if (primaryShortcut) {
        let domain = primaryShortcut.domain;
        return secondaryShortcuts[domain] || {};
    }

    return {};
};