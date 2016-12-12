import injector from './injector.js';

chrome.runtime.onInstalled.addListener((installReason, previousVersion) => {
    console.log('extension onInstall listener,!', installReason.reason);

    if (installReason.reason === 'install') {
        chrome.windows.getAll({populate: true, windowTypes: ['normal']}, windows => {
            windows.forEach(window => {
                window.tabs.filter(tab => {
                    return !tab.url.startsWith('https://chrome.google.com');
                }).forEach(tab => {
                    console.log('tab:', tab);
                    injector.injectTabContentScriptManually(tab.id);
                });
            });
        });
    }
});