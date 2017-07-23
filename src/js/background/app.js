import injector from './injector.js';
import common from '../common.js';
import config from '../config.js';

chrome.runtime.onInstalled.addListener((installReason, previousVersion) => {
    if (installReason.reason === 'install') {
        common.iterateAllWindowTabs(tabId => {
            injector.injectTabContentScriptManually(tabId);
        });
        // chrome.tabs.create({url: config.baseURL + '/welcome'});
    } else if (installReason.reason === 'update') {
        common.iterateAllWindowTabs(tabId => {
            injector.injectTabContentScriptManually(tabId);
        });
    }
});