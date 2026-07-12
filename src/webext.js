// Cross-browser WebExtension API namespace.
//
// Firefox's chrome.* namespace never returns promises — when the callback
// is omitted it injects an empty stub callback (see isChromeCompat in
// Firefox's Schemas.sys.mjs). Its browser.* namespace is promise-native.
// Chrome's MV3 chrome.* returns promises when the callback is omitted.
// So: use browser.* where it exists, chrome.* otherwise, and route every
// promise-style API call through this module.
const webext = typeof browser !== 'undefined' ? browser : chrome;

export default webext;
