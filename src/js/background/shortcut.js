import client from './client.js';
import common from '../common.js';

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