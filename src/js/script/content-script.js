import modal from './modal.js';
import monitor from './key-event-monitor.js';
import circle from './circle.js';


chrome.runtime.sendMessage({resolve: true}, authenticated => {
    resolveAuthentication(authenticated);

    document.addEventListener("DOMContentLoaded", () => {
        circle.injectCircle();
    });
});

function resolveAuthentication(authenticated) {
    if (authenticated) {
        document.addEventListener('keyup', monitor.onKeyUp, false);
        document.addEventListener('keydown', monitor.onKeyDown, false);
    } else {
        document.removeEventListener('keyup', monitor.onKeyUp, false);
        document.removeEventListener('keydown', monitor.onKeyDown, false);
    }
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch (true) {
        case message.authenticated: {
            resolveAuthentication(true);
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