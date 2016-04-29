(function() {
    setTimeout(function() {
        chrome.runtime.sendMessage({loginSuccessful: true, data: {}}, function() {
        })
    }, 1500);
})();