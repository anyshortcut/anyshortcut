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
 * @param files {string[]}
 * @returns {Promise}
 */
function injectResources(files) {
    let getFileExtension = /(?:\.([^.]+))?$/;

    return Promise.all(files.map(resource => {
        new Promise((resolve, reject) => {
            let ext = getFileExtension.exec(resource)[1];
            let injectFunction = loadFunctionForExtension(ext);

            injectFunction(null, {
                file: resource
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
    /**
     * Inject unbound tips javascript and css resources.
     */
    injectUnboundTipsResources() {
        injectResources(['js/script/inject-unbound-tips.js'])
            .then(() => {
                console.log('inject success!');
            }).catch(error => {
            console.log('Eroor occur ${error}');
        });
    }
}