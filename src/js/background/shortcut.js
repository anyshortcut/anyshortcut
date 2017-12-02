import client from '../client.js';
import common from '../common.js';

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
    const nestedShortcut = {};
    nestedShortcut[shortcut.key] = shortcut;
    Object.assign(shortcuts, nestedShortcut);
};

/**
 * Sync all shortcuts from server.
 */
window.syncAllShortcuts = function() {
    client.getPrimaryShortcuts().then(shortcuts => {
        shortcuts = shortcuts || [];
        shortcuts.forEach(item => {
            Object.assign(primaryShortcuts, item);
        });
        console.log('primary:', shortcuts);
    }).catch(error => {
        console.log(error);
    });

    client.getCompoundShortcuts().then(shortcuts => {
        shortcuts.forEach(item => {
            Object.assign(primaryShortcuts, item);
        });
        console.log('compound:', shortcuts);
    }).catch(error => {
        console.log(error);
    });

    client.getSecondaryShortcuts().then(shortcuts => {
        secondaryShortcuts = shortcuts || {};
        console.log('secondary:', secondaryShortcuts);
    }).catch(error => {
        console.log(error);
    });
};

window.bindPrimaryShortcut = function(key, comment, callback) {
    let tab = window.activeTab;
    client.bindShortcut({
        key: key,
        url: tab.url,
        title: tab.title,
        favicon: tab.favIconUrl,
        comment: comment,
        primary: true,
    }).then(shortcut => {
        assignShortcut(primaryShortcuts, shortcut);
        callback(true, shortcut);
    }).catch(error => {
        console.log(error);
        callback(false);
    });
};

window.removePrimaryShortcut = function(shortcut, callback) {
    client.unbindShortcut(shortcut.id)
        .then(response => {
            delete primaryShortcuts[shortcut.key];
            callback(true);
        }).catch(error => {
        console.log(error);
        callback(false);
    });
};

window.bindSecondaryShortcut = function(key, comment, callback) {
    let tab = window.activeTab;
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

        callback(true, shortcut);
    }).catch(error => {
        console.log(error);
        callback(false);
    });
};

window.removeSecondaryShortcut = function(shortcut, callback) {
    client.unbindShortcut(shortcut.id)
        .then(response => {
            let hostname = common.getHostnameFromUrl(shortcut.url);
            let domain = getBoundDomainByHostname(hostname);
            let shortcuts = secondaryShortcuts[domain];
            delete shortcuts[shortcut.key];

            if (Object.keys(shortcuts).length === 0) {
                // Remove empty secondary shortcut at domain level
                // TODO However, all content script need reload again to work as latest delay result.
                delete secondaryShortcuts[domain];
            }

            callback(true);
        }).catch(error => {
        console.log(error);
        callback(false);
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