import modal from './modal.js';
import monitor from './key-event-monitor.js';
import circle from './circle.js';

// Register key events as early as possible.
registerKeyEvents();

document.addEventListener("DOMContentLoaded", event => {
    chrome.runtime.sendMessage({info: true, url: location.href}, response => {
        if (response.authenticated) {
            if (response.showCircle) {
                circle.injectCircle()
            }
            // Store current primary shortcut delay state.
            window.delay = response.delay;
        } else {
            unregisterKeyEvents();
        }
    });
});

function registerKeyEvents() {
    document.addEventListener('keyup', monitor.onKeyUp, false);
    document.addEventListener('keydown', monitor.onKeyDown, false);
}

function unregisterKeyEvents() {
    document.removeEventListener('keyup', monitor.onKeyUp, false);
    document.removeEventListener('keydown', monitor.onKeyDown, false);
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch (true) {
        case message.authenticated: {
            registerKeyEvents();
            break;
        }
        case message.bindSuccess: {
            let shortcut = message.shortcut;
            if (shortcut.primary) {
                modal.showPrimaryShortcutBindSuccess(shortcut);
            } else {
                modal.showSecondaryShortcutBindSuccess(shortcut, message.primaryShortcut);
            }
            break;
        }
    }
});