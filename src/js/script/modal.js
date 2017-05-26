require("../../less/injection-tips.less");

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
 * @param message the message to show in modal, text or html
 */
function openModal(message) {
    let modal = document.createElement('div');
    modal.className = 'modal-overlay';

    let div = document.createElement('div');
    div.className = 'as-injection-div';
    div.innerHTML = message;
    div.firstChild.className = 'as-injection-p';

    let confirmButton = document.createElement('button');
    confirmButton.textContent = 'Yes';
    confirmButton.className = 'as-injection-button';
    confirmButton.onclick = () => {
        removeElementDelay(modal, 50);
    };
    div.appendChild(confirmButton);

    let timeoutId = removeElementDelay(modal);
    div.onmouseover = function(e) {
        if (timeoutId) {
            window.clearTimeout(timeoutId);
            timeoutId = undefined;
        }
    };
    div.onmouseout = function(e) {
        timeoutId = removeElementDelay(modal);
    };
    document.addEventListener('keyup', function(e) {
        if (!e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
            if (e.keyCode === 27) {
                window.clearTimeout(timeoutId);
                timeoutId = undefined;
                removeElementDelay(modal, 50);
            }
        }
    });

    modal.appendChild(div);
    document.body.insertAdjacentElement('beforeEnd', modal);
}

export default {
    showPrimaryShortcutUnbound(pressedKey){
        let innerHtml = `<p>the shortcut key <span id="as-injection-shortcut">ALT+SHIFT+${pressedKey}</span> 
            not bound for this domain yet!</p>`;
        openModal(innerHtml);
    },
    showSecondaryShortcutUnbound(pressedKey){
        let innerHtml = `<p>the secondary shortcut key <span id="as-injection-shortcut">ALT+${pressedKey}</span> 
                        not bound for this domain yet!</p>`;
        openModal(innerHtml);
    },
    showQuickSecondaryShortcutFailed(primaryPressedKey, secondaryPressedKey){
        let innerHtml = `<p>the quick secondary shortcut key 
                        <span id="as-injection-shortcut">SHIFT+ALT+${primaryPressedKey}➯${secondaryPressedKey}</span> 
                        not bound yet!</p>`;
        openModal(innerHtml);
    },
    showShortcutKeyboard(){
        // Do nothing yet
    }
}