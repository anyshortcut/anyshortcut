// Notify Anyshortcut Firefox extension to sync user info.
// As Firefox didn't support "externally_connectable" yet.
chrome.runtime.sendMessage({firefoxRefresh: true}, function(response) {
    console.log(response);
});