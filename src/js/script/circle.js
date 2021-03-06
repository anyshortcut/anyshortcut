import utils from "./utils.js";
import helper from "./helper.js";

let popup = null;
let circle = null;
/**
 * A flag indicates whether the key was pressed.
 */
let keyPressed = false;

const circleIconUrl = chrome.runtime.getURL('icon/icon32.png');
const circleCloseUrl = chrome.runtime.getURL('icon/close.png');

function buildCircle() {
    let circle = utils.createDiv('anyshortcut-circle');
    let img = document.createElement('img');
    img.className = 'anyshortcut-circle-icon';
    img.src = circleIconUrl;

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

        if (shortcuts && Object.keys(shortcuts).length > 0) {
            popup.innerHTML = utils.compile('shortcut-popup',
                {shortcuts: response.shortcuts}
            );
        } else {
            popup.innerHTML = utils.compile('shortcut-list-empty', {
                image: chrome.runtime.getURL('dist/img/grey-balloons.svg')
            });
        }
        // Stop popup click event propagation to document.
        popup.addEventListener('click', event => {
            event.stopPropagation();
        });
        document.body.insertAdjacentElement('beforeBegin', popup);

        circle.firstChild.classList.remove('anyshortcut-circle-icon');
        circle.firstChild.classList.add('anyshortcut-circle-close');
        circle.firstChild.src = circleCloseUrl;
    });
}

function hideShortcutPopup() {
    if (popup) {
        popup.remove();
        popup = null;
        circle.firstChild.classList.add('anyshortcut-circle-icon');
        circle.firstChild.classList.remove('anyshortcut-circle-close');
        circle.firstChild.src = circleIconUrl;
    }
}

export default {
    injectCircle() {
        // Register key and click event in all iframe.
        document.addEventListener('keydown', e => {
            if (helper.isActiveElementEditable()) {
                return;
            }
            if (helper.isValidKeyCode(e.keyCode) && helper.withoutAnyModifier(e)) {
                let keyCodeChar = String.fromCharCode(e.keyCode);

                if (window.isQueryShortcutChooserShowing && ['1', '2'].includes(keyCodeChar)) {
                    return;
                }

                // Stop event propagation in capture phase.
                e.stopPropagation();

                // Prevent repeat
                if (e.repeat) {
                    return;
                }

                keyPressed = true;
            }
        }, true);

        document.addEventListener('keyup', e => {
            if (helper.isActiveElementEditable()) {
                return;
            }

            if (helper.isValidKeyCode(e.keyCode) && helper.withoutAnyModifier(e)) {
                let keyCodeChar = String.fromCharCode(e.keyCode);

                if (window.isQueryShortcutChooserShowing && ['1', '2'].includes(keyCodeChar)) {
                    return;
                }

                if (keyPressed) {
                    // Stop event propagation in capture phase.
                    e.stopPropagation();

                    chrome.runtime.sendMessage({jumpSecondary: true, url: location.href, key: keyCodeChar});
                    keyPressed = false;
                }
            }
        }, true);

        // Auto hide shortcut popup when user click outside of popup.
        document.addEventListener('click', hideShortcutPopup);

        // Only inject circle in top window, ignore all iframe
        if (helper.isTopWindow()) {
            circle = buildCircle();
            circle.onclick = (event) => {
                if (popup) {
                    hideShortcutPopup();
                } else {
                    showShortcutPopup();
                }
            };

            document.body.insertAdjacentElement('beforeBegin', circle);
        }
    },
};