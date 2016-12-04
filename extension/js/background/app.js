import injector from './injector.js';

chrome.runtime.onInstalled.addListener((installReason, previousVersion)=> {
    console.log('extension onInstall listener,!', installReason.reason);

    if (installReason.reason === 'install') {
        console.log('extension installed!');
        chrome.windows.getAll({populate: true, windowTypes: ['normal']}, windows=> {
            windows.forEach(window => {
                window.tabs.forEach(tab => {
                    injector.injectTabContentScriptManually(tab.id);
                });
            });
        });
    }
});