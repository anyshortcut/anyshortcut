require("../../less/injection-tips.less");
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

/**
 * @param content the message to show in modal, text or html
 */
function openModal(content) {
    let div = document.createElement('div');
    div.className = 'modal-content';
    div.innerHTML = content;

    let modal = buildModal(div);
    document.body.insertAdjacentElement('beforeEnd', modal);
    return modal;
}

function buildHeader(onClose) {
    let header = document.createElement('div');
    header.className = 'modal-header';
    header.textContent = 'anyshortcut';

    let closeButton = document.createElement('button');
    closeButton.className = 'modal-header-close';
    closeButton.textContent = 'X';
    if (onClose) {
        closeButton.onclick = onClose;
    }

    header.appendChild(closeButton);
    return header;
}

function buildModal(content) {
    let modal = document.createElement('div');
    modal.className = 'modal';
    // Set a dedicated attribute to handle css mixed issue.
    modal.setAttribute('c-xs-fe2cxw', '');

    let container = document.createElement('div');
    container.className = 'modal-container';

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
    document.addEventListener('keyup', function(e) {
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
        let innerHtml = `<p>the shortcut key <span class="shortcut">ALT+SHIFT+${pressedKey}</span> 
            not bound for this domain yet!</p>`;
        openModal(innerHtml);
    },
    showSecondaryShortcutUnbound(pressedKey){
        let innerHtml = `<p>the secondary shortcut key <span class="shortcut">ALT+${pressedKey}</span> 
                        not bound for this domain yet!</p>`;
        openModal(innerHtml);
    },
    showQueryShortcutFailed(firstKey, secondKey){
        let innerHtml = `<p>neither <span class="shortcut">SHIFT+ALT+${firstKey}${secondKey}</span>
                        nor <span class="shortcut">SHIFT+ALT+${firstKey}➯${secondKey}</span> 
                        bound yet!</p>`;
        openModal(innerHtml);
    },
    showQueryShortcutChooser(primaryShortcut, secondaryShortcut){
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
            let keyCode = e.keyCode;
            let shortcut = null;
            if (keyCode === 49) {
                shortcut = primaryShortcut;
            } else if (keyCode === 50) {
                shortcut = secondaryShortcut;
            }

            if (shortcut) {
                helper.openShortcut(shortcut);
                removeElementDelay(modal, 50);
                document.removeEventListener('keyup', chooserEventListener);
            }
        };
        document.addEventListener('keyup', chooserEventListener);
    },
    showShortcutKeyboard(){
        // Do nothing yet
    }
}