import client from './client.js';
import common from '../common.js';

window.primaryShortcuts = {};
window.secondaryShortcuts = {};

/**
 * Sync all shortcuts from server.
 */
window.syncAllShortcuts = function() {
    client.getPrimaryShortcuts().then(shortcuts => {
        shortcuts = shortcuts || [];
        shortcuts.forEach(item => {
            Object.assign(primaryShortcuts, item)
        });
        console.log('primary:', primaryShortcuts);
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

window.bindPrimaryShortcut = function(key, comment, tab, force, callback) {
    client.bindShortcut({
        key: key,
        url: tab.url,
        title: tab.title,
        favicon: tab.favIconUrl,
        comment: comment,
        primary: true,
        force: force || false,
    }).then(response => {
        Object.assign(primaryShortcuts, response);
        callback(true);
        // window.setPopupIcon(true);
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
            // window.setPopupIcon(false);
        }).catch(error => {
        console.log(error);
        callback(false);
    });
};

window.bindSecondaryShortcut = function(key, comment, tab, force, callback) {
    client.bindShortcut({
        key: key,
        url: tab.url,
        title: tab.title,
        favicon: tab.favIconUrl,
        comment: comment,
        primary: false,
        force: force || false,
    }).then(response => {
        let domain = response[key]['domain'];
        if (!secondaryShortcuts.hasOwnProperty(domain)) {
            secondaryShortcuts[domain] = {}
        }
        Object.assign(secondaryShortcuts[domain], response);

        callback(true);
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

            callback(true);
        }).catch(error => {
        console.log(error);
        callback(false);
    });
};

window.getSecondaryShortcutByUrl = function(url) {
    // Only return the domain specific secondary shortcuts by url.
    let hostname = common.getHostnameFromUrl(url);
    let domain = getBoundDomainByHostname(hostname);
    return domain ? secondaryShortcuts[domain] : {};
};