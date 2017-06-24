require("../../less/content-script.less");
import helper from "./helper.js";

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
    modal.focus();
    return modal;
}

function buildHeader(onClose) {
    let header = createDiv('anyshortcut-modal-header');
    header.textContent = 'anyshortcut';

    let closeButton = document.createElement('button');
    closeButton.className = 'anyshortcut-modal-close';
    closeButton.textContent = 'X';
    if (onClose) {
        closeButton.onclick = onClose;
    }

    header.appendChild(closeButton);
    return header;
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

    container.appendChild(buildHeader(function(e) {
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
        removeElementDelay(modal, 50);
    }));

    container.appendChild(content);
    modal.appendChild(container);
    return modal;
}

export default {
    showPrimaryShortcutUnbound(pressedKey){
        let innerHtml = `<p>the shortcut key <span class="anyshortcut-shortcut">ALT+SHIFT+${pressedKey}</span> 
            not bound for this domain yet!</p>`;
        openModal(innerHtml);
    },
    showSecondaryShortcutUnbound(pressedKey){
        let innerHtml = `<p>the secondary shortcut key <span class="anyshortcut-shortcut">ALT+${pressedKey}</span> 
                        not bound for this domain yet!</p>`;
        openModal(innerHtml);
    },
    showQueryShortcutFailed(firstKey, secondKey){
        let innerHtml = `<p>neither <span class="anyshortcut-shortcut">SHIFT+ALT+${firstKey}${secondKey}</span>
                        nor <span class="anyshortcut-shortcut">SHIFT+ALT+${firstKey}➯${secondKey}</span> 
                        bound yet!</p>`;
        openModal(innerHtml);
    },
    showQueryShortcutChooser(primaryShortcut, secondaryShortcut, byBlank){
        let innerHtml = `<ul>
                            <li><div>
                            #1 <img src="${primaryShortcut.favicon}" alt=""> ${primaryShortcut.title}
                            </div></li>
                            <li><div>
                            #2 <img src="${secondaryShortcut.favicon}" alt=""> ${secondaryShortcut.title}
                            </div></li>
                        </ul>`;
        let modal = openModal(innerHtml);

        let chooserEventListener = function(e) {
            if (helper.isValidKeyCodeWithoutModifiers(e)) {
                let keyCode = e.keyCode;
                let shortcut = null;
                if (keyCode === 49) {
                    shortcut = primaryShortcut;
                } else if (keyCode === 50) {
                    shortcut = secondaryShortcut;
                }

                if (shortcut) {
                    helper.openShortcut(shortcut, byBlank);
                    removeElementDelay(modal, 50);
                    modal.removeEventListener('keyup', chooserEventListener);
                }
            }
        };
        modal.addEventListener('keyup', chooserEventListener);
    },
    showSecondaryShortcutList(shortcuts, byBlank){
        let liElements = '';
        for (let key in shortcuts) {
            if (shortcuts.hasOwnProperty(key)) {
                let shortcut = shortcuts[key];
                liElements += `<li><div>
                            ${shortcut.key} <img src="${shortcut.favicon}" alt=""> ${shortcut.title}
                </div></li>`;
            }
        }

        let innerHtml = '<ul>' + liElements + '</ul>';
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