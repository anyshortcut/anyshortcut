(function() {
    var intervalId = setInterval(function() {
        if (location.pathname.endsWith('/auth/success')) {
            chrome.runtime.sendMessage({loginSuccessful: true});
            clearInterval(intervalId);
            window.close();
        }
    }, 1000);
})();