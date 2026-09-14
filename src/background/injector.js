/**
 * Injects the content script and its stylesheet into a tab with the
 * MV3 chrome.scripting API (chrome.tabs.executeScript is gone in MV3).
 */
import webext from '../webext.js';

async function injectResources(tabId) {
  await webext.scripting.executeScript({
    target: { tabId, allFrames: true },
    files: ['content-script.js'],
  });
  await webext.scripting.insertCSS({
    target: { tabId, allFrames: true },
    files: ['content-script.css'],
  });
}

export default {
  injectTabContentScriptManually(tabId) {
    injectResources(tabId)
      .then(() => {
        console.log('inject success!');
      })
      .catch((error) => {
        // Expected on chrome://, the Web Store and other restricted pages.
        console.log(`Error occur ${error}`);
      });
  },
};
