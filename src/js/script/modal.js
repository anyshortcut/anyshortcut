require("../../less/content-script.less");
import helper from "./helper.js";
import utils from "./utils.js";

let timeoutId = undefined;
// A global flag indicates whether the query chooser is showing,
// to prevent query chooser key conflict with secondary shortcut.
window.isQueryShortcutChooserShowing = false;

function removeElementDelay(element, delay) {
    timeoutId = window.setTimeout(() => {
        if (element) {
            element.remove();
        }
        timeoutId = undefined;
        window.isQueryShortcutChooserShowing = false;
    }, delay || 2000);
}

/**
 * @param content the message to show in modal, text or html
 */
function openModal(content) {
    let div = utils.createDiv('anyshortcut-modal-content');
    div.innerHTML = content;

    let modal = buildModal(div);
    window.top.document.body.insertAdjacentElement('beforeBegin', modal);

    let closeButton = window.top.document.getElementById('anyshortcut-modal-close');
    closeButton.onclick = function() {
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
        removeElementDelay(modal, 50);
    };
    modal.focus();
    return modal;
}

function buildModal(content) {
    let modal = utils.createDiv('anyshortcut-modal');
    modal.tabIndex = 0;

    let container = utils.createDiv('anyshortcut-modal-container');

    removeElementDelay(modal);
    container.onmouseover = function(e) {
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
    };
    container.onmouseout = function(e) {
        removeElementDelay(modal);
    };
    modal.addEventListener('keyup', function(e) {
        if (e.keyCode === 27) {
            window.clearTimeout(timeoutId);
            timeoutId = undefined;
            removeElementDelay(modal, 50);
        }
    });

    let header = utils.createDiv('anyshortcut-modal-header');
    header.innerHTML = utils.compile(require('%/modal-header.html'),
        {logo: chrome.runtime.getURL('icon/logo.svg')});
    container.appendChild(header);
    container.appendChild(content);

    modal.appendChild(container);
    return modal;
}

export default {
    showAuthenticatedRequired() {
        openModal(utils.compile(require('%/authenticate-required.html')));
    },
    showWrongCombinationKey(wrongKey) {
        openModal(utils.compile(require('%/wrong-combination-key.html'), {
            combinationKey: wrongKey === 'alt' ? 'SHIFT' : 'ALT',
            wrongCombinationKey: wrongKey.toUpperCase(),
        }));
    },
    showPrimaryShortcutBindSuccess(shortcut) {
        openModal(utils.compile(require('%/primary-bind-success.html'), {
            key: shortcut.key,
        }));
    },
    showSecondaryShortcutBindSuccess(shortcut, primaryShortcut) {
        // Only show secondary shortcut bind modal for one key primary shortcut.
        if (primaryShortcut.key.length === 1) {
            openModal(utils.compile(require('%/secondary-bind-success.html'), {
                key: shortcut.key,
                primaryShortcut: primaryShortcut,
            }));
        }
    },
    showPrimaryShortcutUnbound(pressedKey) {
        openModal(utils.compile(require('%/shortcut-not-found.html'), {
            shortcutType: "primary",
            key: "ALT + " + pressedKey
        }));
    },
    showQueryShortcutFailed(firstKey, secondKey) {
        openModal(utils.compile(require('%/query-shortcut-failed.html'), {
            firstKey: firstKey,
            secondKey: secondKey,
        }));
    },
    showQueryShortcutChooser(primaryShortcut, secondaryShortcut, byBlank) {
        let modal = openModal(utils.compile(require('%/query-shortcut-chooser.html'), {
            shortcuts: [primaryShortcut, secondaryShortcut]
        }));

        let chooserEventListener = function(e) {
            if (helper.isValidKeyCode(e.keyCode) && helper.withoutAnyModifier(e)) {
                let keyCodeChar = String.fromCharCode(e.keyCode);
                let shortcut = null;
                if (keyCodeChar === '1') {
                    shortcut = primaryShortcut;
                } else if (keyCodeChar === '2') {
                    shortcut = secondaryShortcut;
                }

                if (shortcut) {
                    removeElementDelay(modal, 50);
                    modal.removeEventListener('keyup', chooserEventListener);
                    chrome.runtime.sendMessage({
                        open: true, url: shortcut.url, shortcutId: shortcut.id
                    });
                }
            }
        };
        modal.addEventListener('keyup', chooserEventListener);
        window.isQueryShortcutChooserShowing = true;
    },
    showSubscriptionExpired() {
        openModal(utils.compile(require('%/subscription-expired.html')));
    }
}