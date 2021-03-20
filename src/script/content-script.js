import modal from './modal.js';
import monitor from './key-event-monitor.js';
import circle from './circle.js';

// Register key events as early as possible.
document.addEventListener('keyup', monitor.onKeyUp, false);
document.addEventListener('keydown', monitor.onKeyDown, false);

chrome.runtime.sendMessage({info: true, url: location.href}, response => {
    if (response.showCircle) {
        if (document.readyState !== "loading") {
            circle.injectCircle();
        } else {
            document.addEventListener("DOMContentLoaded", event => {
                circle.injectCircle();
            });
        }
    }
    // Store current primary shortcut delay state.
    window.delay = response.delay;
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch (true) {
        case message.bindSuccess: {
            window.delay = message.delay;

            let shortcut = message.shortcut;
            if (shortcut.primary) {
                modal.showPrimaryShortcutBindSuccess(message.combinationKey, shortcut);
            } else {
                modal.showSecondaryShortcutBindSuccess(message.combinationKey, shortcut, message.primaryShortcut);
            }
            break;
        }
    }
});