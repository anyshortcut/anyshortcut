import utils from "./utils.js";
import helper from "./helper.js";

let popup = null;

function buildCircle() {
    let circle = utils.createDiv('anyshortcut-circle');
    let img = document.createElement('img');
    img.className = 'anyshortcut-circle-icon';

    circle.appendChild(img);
    return circle;
}

function showShortcutPopup(shortcuts) {
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
        document.body.insertAdjacentElement('beforeBegin', popup);
    });
}

function hideShortcutPopup() {
    if (popup) {
        popup.remove();
        popup = null;
    }
}

export default {
    injectCircle() {
        chrome.runtime.sendMessage({
            listSecondary: true, url: location.href
        }, response => {
            let shortcuts = response.shortcuts;

            document.addEventListener('keyup', e => {
                if (helper.isActiveElementEditable()) {
                    return;
                }

                if (helper.isValidKeyCode(e.keyCode) && helper.withoutAnyModifier(e)) {
                    let keyCodeChar = String.fromCharCode(e.keyCode);
                    if (shortcuts.hasOwnProperty(keyCodeChar)) {
                        helper.openShortcut(shortcuts[keyCodeChar], false);
                    }
                }
            });

            let circle = buildCircle();
            circle.onclick = (event) => {
                if (popup) {
                    circle.firstChild.classList.add('anyshortcut-circle-icon');
                    circle.firstChild.classList.remove('anyshortcut-circle-close');
                    hideShortcutPopup();
                } else {
                    circle.firstChild.classList.remove('anyshortcut-circle-icon');
                    circle.firstChild.classList.add('anyshortcut-circle-close');
                    showShortcutPopup(shortcuts);
                }
            };

            document.body.insertAdjacentElement('beforeBegin', circle);
        });
    },
};