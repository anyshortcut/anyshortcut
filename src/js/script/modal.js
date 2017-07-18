require("../../less/content-script.less");
import helper from "./helper.js";
import template from "./templates.js";

function removeElementDelay(element, delay) {
    let timeoutId = window.setTimeout(() => {
        if (document.body.contains(element)) {
            document.body.removeChild(element);
        }
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
    }, delay || 3000);
    return timeoutId;
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

    let timeoutId = removeElementDelay(modal);
    container.onmouseover = function(e) {
        if (timeoutId) {
            window.clearTimeout(timeoutId);
            timeoutId = undefined;
        }
    };
    container.onmouseout = function(e) {
        timeoutId = removeElementDelay(modal);
    };
    modal.addEventListener('keyup', function(e) {
        if (e.keyCode === 27) {
            window.clearTimeout(timeoutId);
            timeoutId = undefined;
            removeElementDelay(modal, 50);
        }
    });

    let header = createDiv('anyshortcut-modal-header');
    header.innerHTML = template.compile(template.modalHeader);
    container.appendChild(header);
    container.appendChild(content);
    modal.appendChild(container);
    return modal;
}

export default {
    showPrimaryShortcutUnbound(pressedKey) {
        openModal(template.compile(template.shortcutNotFound, {
            shortcutType: "primary",
            key: "ALT+SHIFT+" + pressedKey
        }));
    },
    showSecondaryShortcutUnbound(pressedKey) {
        openModal(template.compile(template.shortcutNotFound, {
            shortcutType: "secondary",
            key: "ALT+" + pressedKey,
        }));
    },
    showQueryShortcutFailed(firstKey, secondKey) {
        openModal(template.compile(template.queryShortcutFailed, {
            firstKey: firstKey,
            secondKey: secondKey,
        }));
    },
    showQueryShortcutChooser(primaryShortcut, secondaryShortcut, byBlank) {
        let modal = openModal(template.compile(template.queryShortcutChooser, {
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
                    helper.openShortcut(shortcut, openByBlank);
                    removeElementDelay(modal, 50);
                    modal.removeEventListener('keyup', chooserEventListener);
                }
            }
        };
        modal.addEventListener('keyup', chooserEventListener);
    },
    showSecondaryShortcutList(pressedKey, shortcuts, byBlank) {
        let innerHtml;

        if (Object.keys(shortcuts).length === 0) {
            innerHtml = template.compile(template.shortcutListEmpty, {key: pressedKey});
        } else {
            innerHtml = template.compile(template.shortcutList, {
                key: pressedKey,
                shortcuts: shortcuts
            });
        }

        let modal = openModal(innerHtml);

        let listEventListener = function(e) {
            if (helper.isValidKeyCodeWithoutModifiers(e)) {

                let keyCodeChar = String.fromCharCode(e.keyCode);
                if (shortcuts.hasOwnProperty(keyCodeChar)) {
                    helper.openShortcut(shortcuts[keyCodeChar], byBlank);
                    removeElementDelay(modal, 50);
                    modal.removeEventListener('keyup', listEventListener);
                }
            }
        };

        modal.addEventListener('keyup', listEventListener);
    }
}