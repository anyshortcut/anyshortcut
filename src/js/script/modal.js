require("../../less/content-script.less");
import helper from "./helper.js";
import utils from "./utils.js";

let timeoutId = undefined;

function removeElementDelay(element, delay) {
    timeoutId = window.setTimeout(() => {
        if (element) {
            element.remove();
        }
        timeoutId = undefined;
    }, delay || 2000);
}

/**
 * @param content the message to show in modal, text or html
 */
function openModal(content) {
    let div = utils.createDiv('anyshortcut-modal-content');
    div.innerHTML = content;

    let modal = buildModal(div);
    document.body.insertAdjacentElement('beforeBegin', modal);

    let closeButton = document.getElementById('anyshortcut-modal-close');
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
    header.innerHTML = utils.compile(require('%/modal-header.html'));
    container.appendChild(header);
    container.appendChild(content);
    modal.appendChild(container);
    return modal;
}

export default {
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
    showSecondaryShortcutUnbound(pressedKey) {
        openModal(utils.compile(require('%/shortcut-not-found.html'), {
            shortcutType: "secondary",
            key: pressedKey,
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
            if (helper.isValidKeyCode(e) && helper.withoutAnyModifier(e)) {
                let keyCode = e.keyCode;
                let shortcut = null;
                if (keyCode === 49) {
                    shortcut = primaryShortcut;
                } else if (keyCode === 50) {
                    shortcut = secondaryShortcut;
                }

                if (shortcut) {
                    removeElementDelay(modal, 50);
                    modal.removeEventListener('keyup', chooserEventListener);
                    helper.openShortcut(shortcut, byBlank);
                }
            }
        };
        modal.addEventListener('keyup', chooserEventListener);
    },
    showSubscriptionExpired() {
        openModal(utils.compile(require('%/subscription-expired.html')));
    }
}