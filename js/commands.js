var currentTab = null;
var removedTab = null;
var switchToLastTabOnExit = false;
var previousTabsByWindow = {};

// set current tab and window on load
initializeWindow();

// Update variables on tab removed
chrome.tabs.onRemoved.addListener(tabRemovedCallback);

// Update variables on window removed
chrome.windows.onRemoved.addListener(windowRemovedCallback);

// Update variables on tab change
chrome.tabs.onSelectionChanged.addListener(selectionChangedCallback);

// Keyboard shortcut toggle function
chrome.commands.onCommand.addListener(function(command) {
    if (command == "toggle_recent_tab") {
        switchToPreviousTabCallback();
    } else if (command === "back_to_oldest") {

    } else if (command === "forward_to_latest") {

    } else if (command === "jump_to_home") {
        onCommandJumpToHome();
    }
});

function getSettings() {
    var settings = localStorage.getItem('tsrltSettings');

    if (settings !== null && settings !== 'null') {
        settings = JSON.parse(settings);
    } else {
        settings = {
            switchOnClose: false
        };
        localStorage.setItem('tsrltSettings', JSON.stringify(settings));
    }
    return settings;
}

function getPreviousTabs(callback) { // get _current_ window tabs from previousTabsByWindow
    return getCurrentWindow(function(window) {
        var wKey = getWKey(window.id);

        if (!previousTabsByWindow[wKey]) {
            return initializeWindow(window.id, callback);
        }

        callback && callback(previousTabsByWindow[wKey]);
    });
}

function getCurrentTab(wId, callback) {
    var windowId = wId === chrome.windows.WINDOW_ID_NONE ? chrome.windows.WINDOW_ID_CURRENT : wId;
    chrome.tabs.getSelected(windowId, function(tab) {
        callback(tab.id, tab.windowId);
    });
}

function getCurrentWindow(callback) {
    chrome.windows.getLastFocused({
        populate: true
    }, function(window) {
        callback(window);
    });
}

function initializeWindow(wId, callback) {
    getCurrentTab(wId, function(tab, wId) {
        var wKey = getWKey(wId);
        currentTab = tab;
        previousTabsByWindow[wKey] = [currentTab];
        // var settings = getSettings();
        // switchToLastTabOnExit = settings.switchOnClose;
        callback && callback(previousTabsByWindow[wKey]);
    });
}

function getWKey(wId) { // generate an object key by window id
    return 'w_' + wId;
}

function windowRemovedCallback(wId) {
    var wKey = getWKey(wId);
    delete previousTabsByWindow[wKey];
}

function tabRemovedCallback(removedId) {
    removedTab = removedId;
    getPreviousTabs(function(previousTabs) {
        removeTab(previousTabs, removedId);
    });
}

function removeTab(previousTabs, removedId) {
    var index = previousTabs.indexOf(removedId);
    if (index !== -1) {
        previousTabs.splice(index, 1);
    }
}

function selectionChangedCallback(tab) {
    getPreviousTabs(function(previousTabs) {
        removeTab(previousTabs, currentTab);
        var lastTab = previousTabs[previousTabs.length - 1] || tab;

        if (currentTab !== removedTab) {
            previousTabs.push(currentTab);
        } else {
            removedTab = null;
            if (lastTab !== tab && switchToLastTabOnExit) {
                return switchToPreviousTab(previousTabs);
            }
        }
        removedTab = null;
        currentTab = tab;
    });
}

function switchToPreviousTabCallback() {
    getPreviousTabs(function(previousTabs) {
        switchToPreviousTab(previousTabs);
    });
}

function switchToPreviousTab(previousTabs) {
    var nextTab;
    while (previousTabs.length) {
        nextTab = previousTabs.pop();
        if (nextTab !== currentTab) {
            break;
        }
    }

    chrome.tabs.update(nextTab, {
        selected: true
    }, function() {
        if (chrome.runtime.lastError && previousTabs.length) { // invalid tab, try next one
            return switchToPreviousTab(previousTabs);
        }
    });
}
