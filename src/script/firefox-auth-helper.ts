// Firefox has no externally_connectable, so anyshortcut.com cannot message
// the extension directly the way it does in Chrome. This content script runs
// on the pages that mean "the session just changed" and forwards the news to
// the background, which then re-syncs cloud mode.
chrome.runtime.sendMessage({ firefoxRefresh: true }, (response) => {
  console.log('Anyshortcut sync requested:', response);
});
