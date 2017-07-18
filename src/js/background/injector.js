/**
 * Helper function that returns appropriate chrome.tabs function to load resource
 */
function loadFunctionForExtension(ext) {
    switch (ext) {
        case 'js':
            return chrome.tabs.executeScript;
        case 'css':
            return chrome.tabs.insertCSS;
        default:
            throw new Error('Unsupported resource type')
    }
}

/**
 * Injects resources provided as paths into active tab in chrome
 * @param tabId   defaults to the active tab of the current window
 * @param files {string[]}
 * @returns {Promise}
 */
function injectResources(tabId, files) {
    let getFileExtension = /(?:\.([^.]+))?$/;

    return Promise.all(files.map(resource => {
        new Promise((resolve, reject) => {
            let ext = getFileExtension.exec(resource)[1];
            let injectFunction = loadFunctionForExtension(ext);

            injectFunction(tabId, {
                file: resource,
                runAt: 'document_start',
            }, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    }));
}

export default {
    injectTabContentScriptManually(tabId) {
        injectResources(tabId, ['dist/content_script.js'])
            .then(() => {
                console.log('inject success!');
            }).catch(error => {
            console.log(`Error occur ${error}`);
        });
    }
}