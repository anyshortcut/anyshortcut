require("../../less/content-script.less");
import _ from "lodash";
import helper from "./helper.js";

let timeoutId = undefined;

function removeElementDelay(element, delay) {
    timeoutId = window.setTimeout(() => {
        if (document.body.contains(element)) {
            document.body.removeChild(element);
        }
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
    }, delay || 3000);
}

function createDiv(className) {
    let div = document.createElement('div');
    div.className = className;
    return div;
}

/**
 * @param content the message to show in modal, text or html
 */
function openModal(content) {
    let div = createDiv('anyshortcut-modal-content');
    div.innerHTML = content;

    let modal = buildModal(div);
    document.body.insertAdjacentElement('beforeEnd', modal);

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
    let modal = createDiv('anyshortcut-modal');
    modal.tabIndex = 0;

    let container = createDiv('anyshortcut-modal-container');

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

    let header = createDiv('anyshortcut-modal-header');
    header.innerHTML = compile(require('%/modal-header.html'));
    container.appendChild(header);
    container.appendChild(content);
    modal.appendChild(container);
    return modal;
}

function compile(template, data) {
    return _.template(template)(data);
}

export default {
    showPrimaryShortcutBindSuccess(shortcut) {
        openModal(compile(require('%/primary-bind-success.html'), {
            key: shortcut.key,
        }));
    },
    showSecondaryShortcutBindSuccess(shortcut, primaryShortcut) {
        openModal(compile(require('%/secondary-bind-success.html'), {
            key: shortcut.key,
            primaryShortcut: primaryShortcut,
        }));
    },
    showPrimaryShortcutUnbound(pressedKey) {
        openModal(compile(require('%/shortcut-not-found.html'), {
            shortcutType: "primary",
            key: "ALT+SHIFT+" + pressedKey
        }));
    },
    showSecondaryShortcutUnbound(pressedKey) {
        openModal(compile(require('%/shortcut-not-found.html'), {
            shortcutType: "secondary",
            key: "ALT+" + pressedKey,
        }));
    },
    showQueryShortcutFailed(firstKey, secondKey) {
        openModal(compile(require('%/query-shortcut-failed.html'), {
            firstKey: firstKey,
            secondKey: secondKey,
        }));
    },
    showQueryShortcutChooser(primaryShortcut, secondaryShortcut, byBlank) {
        let modal = openModal(compile(require('%/query-shortcut-chooser.html'), {
            shortcuts: [primaryShortcut, secondaryShortcut]
        }));

        let chooserEventListener = function(e) {
            if (helper.isValidKeyCodeWithoutModifiers(e)) {
                let keyCode = e.keyCode;
                let shortcut = null;
                let openByBlank = null;
                if (keyCode === 49) {
                    shortcut = primaryShortcut;
                    openByBlank = byBlank.primary;
                } else if (keyCode === 50) {
                    shortcut = secondaryShortcut;
                    openByBlank = byBlank.secondary;
                }

                if (shortcut) {
                    removeElementDelay(modal, 50);
                    modal.removeEventListener('keyup', chooserEventListener);
                    helper.openShortcut(shortcut, openByBlank);
                }
            }
        };
        modal.addEventListener('keyup', chooserEventListener);
    },
    showSecondaryShortcutList(pressedKey, shortcuts, byBlank) {
        let innerHtml;

        if (Object.keys(shortcuts).length === 0) {
            innerHtml = compile(require('%/shortcut-list-empty.html'), {key: pressedKey});
        } else {
            innerHtml = compile(require('%/shortcut-list.html'), {
                key: pressedKey,
                shortcuts: shortcuts
            });
        }

        let modal = openModal(innerHtml);

        let listEventListener = function(e) {
            if (helper.isValidKeyCodeWithoutModifiers(e)) {

                let keyCodeChar = String.fromCharCode(e.keyCode);
                if (shortcuts.hasOwnProperty(keyCodeChar)) {
                    removeElementDelay(modal, 50);
                    modal.removeEventListener('keyup', listEventListener);
                    helper.openShortcut(shortcuts[keyCodeChar], byBlank);
                }
            }
        };

        modal.addEventListener('keyup', listEventListener);
    }
}