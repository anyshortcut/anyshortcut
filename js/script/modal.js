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
 *
 * @param message the message to show in modal, text or html
 * @param positiveCallback
 * @param showNegativeButton whether to show the negative button.
 */
function openModal(message, positiveCallback = null, showNegativeButton = true) {
    let modal = document.createElement('div');
    modal.className = 'modal-overlay';

    let div = document.createElement('div');
    div.className = 'as-injection-div';
    div.innerHTML = message;
    div.firstChild.className = 'as-injection-p';

    let positiveButton = document.createElement('button');
    positiveButton.textContent = 'Yes';
    positiveButton.className = 'as-injection-button';
    positiveButton.onclick = () => {
        removeElementDelay(modal, 50);
        if (positiveCallback) {
            positiveCallback();
        }
    };
    div.appendChild(positiveButton);

    if (showNegativeButton) {
        let negativeButton = document.createElement('button');
        negativeButton.textContent = 'No';
        negativeButton.className = 'as-injection-button';
        negativeButton.onclick = () => {
            removeElementDelay(modal, 50);
        };
        div.appendChild(negativeButton);
    }


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

function showBoundSuccessTipDialog() {
    let divTips = document.createElement('div');
    divTips.className = 'as-injection-div';
    divTips.innerHTML = 'Great! you bound the url with this key!';
    document.body.insertAdjacentElement('beforeEnd', divTips);

    removeElementDelay(divTips)
}

export default {
    showPrimaryShortcutUnbound(pressedKey){
        let innerHtml = `<p>the shortcut key <span id="as-injection-shortcut">ALT+SHIFT+${pressedKey}</span> 
            not bound for this domain yet!</p>
            <p>Would you like to bound this primary key with the url?</p>`;
        openModal(innerHtml, function() {
            chrome.runtime.sendMessage({save: true, key: pressedKey}, response => {
                showBoundSuccessTipDialog();
            });
        });
    },
    showSecondaryShortcutUnbound(pressedKey){
        let innerHtml = `<p>the secondary shortcut key <span id="as-injection-shortcut">ALT+${pressedKey}</span> 
                        not bound for this domain yet!</p><p>Would you like to bound this secondary key with the domain?</p>`;
        openModal(innerHtml, function() {
            chrome.runtime.sendMessage({
                secondarySave: true,
                key: pressedKey,
                comment: null,
            }, response => {
                showBoundSuccessTipDialog();
            });
        });
    },
    showQuickSecondaryShortcutFailed(primaryPressedKey, secondaryPressedKey){
        let innerHtml = `<p>the quick secondary shortcut key 
                        <span id="as-injection-shortcut">SHIFT+ALT+${primaryPressedKey}➯${secondaryPressedKey}</span> 
                        not bound yet!</p>`;
        openModal(innerHtml, null, false);
    }
}