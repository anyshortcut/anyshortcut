import utils from "./utils.js";
import helper from "./helper.js";

let popup = null;
let circle = null;
/**
 * A flag indicates whether the key was pressed.
 */
let keyPressed = false;

function buildCircle() {
    let circle = utils.createDiv('anyshortcut-circle');
    let img = document.createElement('img');
    img.className = 'anyshortcut-circle-icon';

    circle.appendChild(img);
    return circle;
}

function showShortcutPopup() {
    // List latest secondary shortcut at each shortcut popup show time
    chrome.runtime.sendMessage({
        listSecondary: true, url: location.href
    }, response => {
        popup = utils.createDiv('anyshortcut-popup');
        let shortcuts = response.shortcuts;

        if (Object.keys(shortcuts).length === 0) {
            popup.innerHTML = utils.compile(require('%/shortcut-list-empty.html'));
        } else {
            popup.innerHTML = utils.compile(require('%/shortcut-popup.html'),
                {shortcuts: response.shortcuts}
            );
        }
        // Stop popup click event propagation to document.
        popup.addEventListener('click', event => {
            event.stopPropagation();
        });
        document.body.insertAdjacentElement('beforeBegin', popup);

        circle.firstChild.classList.remove('anyshortcut-circle-icon');
        circle.firstChild.classList.add('anyshortcut-circle-close');
    });
}

function hideShortcutPopup() {
    if (popup) {
        popup.remove();
        popup = null;
        circle.firstChild.classList.add('anyshortcut-circle-icon');
        circle.firstChild.classList.remove('anyshortcut-circle-close');
    }
}

export default {
    injectCircle() {
        chrome.runtime.sendMessage({
            listSecondary: true, url: location.href
        }, response => {
            let shortcuts = response.shortcuts;

            document.addEventListener('keydown', e => {
                if (helper.isActiveElementEditable()) {
                    return;
                }
                if (helper.isValidKeyCode(e.keyCode) && helper.withoutAnyModifier(e)) {
                    let keyCodeChar = String.fromCharCode(e.keyCode);

                    if (window.isQueryShortcutChooserShowing && ['1', '2'].includes(keyCodeChar)) {
                        return;
                    }

                    // Prevent repeat
                    if (e.repeat) {
                        return;
                    }

                    if (shortcuts.hasOwnProperty(keyCodeChar)) {
                        keyPressed = true;
                    }
                }
            });

            document.addEventListener('keyup', e => {
                if (helper.isActiveElementEditable()) {
                    return;
                }

                if (helper.isValidKeyCode(e.keyCode) && helper.withoutAnyModifier(e)) {
                    let keyCodeChar = String.fromCharCode(e.keyCode);

                    if (window.isQueryShortcutChooserShowing && ['1', '2'].includes(keyCodeChar)) {
                        return;
                    }

                    if (shortcuts.hasOwnProperty(keyCodeChar) && keyPressed) {
                        helper.openShortcut(shortcuts[keyCodeChar], false);
                        keyPressed = false;
                    }
                }
            });

            circle = buildCircle();
            circle.onclick = (event) => {
                if (popup) {
                    hideShortcutPopup();
                } else {
                    showShortcutPopup();
                }
            };

            document.body.insertAdjacentElement('beforeBegin', circle);

            // Auto hide shortcut popup when user click outside of popup.
            document.addEventListener('click', hideShortcutPopup);

            // Hide circle in iframe
            if (!helper.isTopWindow()) {
                circle.classList.add('anyshortcut-circle-hidden');
            }
        });
    },
};