import injector from './injector.js';
import common from '../common.js';

chrome.runtime.onInstalled.addListener((installReason, previousVersion) => {
    console.log('extension onInstall listener,!', installReason.reason);

    if (installReason.reason === 'install') {
        common.iterateAllWindowTabs(tabId => {
            injector.injectTabContentScriptManually(tabId);
        });
    }
});