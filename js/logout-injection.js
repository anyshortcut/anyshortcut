(function() {
    chrome.runtime.sendMessage({logout: true, data: {}}, function() {
    })
})();