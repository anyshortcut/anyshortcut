function removeElementDelay(element, delay) {
    let timeoutId = window.setTimeout(() => {
        document.body.removeChild(element);
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
    }, delay || 3000);
}

/**
 *
 * @param message the message to show in dialog, text or html
 * @param positiveCallback
 * @param showNegativeButton whether to show the negative button.
 */
function showTipDialog(message, positiveCallback = null, showNegativeButton = true) {
    let div = document.createElement('div');
    div.className = 'as-injection-div';
    div.innerHTML = message;
    div.firstChild.className = 'as-injection-p';

    let positiveButton = document.createElement('button');
    positiveButton.textContent = 'Yes';
    positiveButton.className = 'as-injection-button';
    positiveButton.onclick = () => {
        removeElementDelay(div, 80);
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
            removeElementDelay(div, 80);
        };
        div.appendChild(negativeButton);
    }

    document.body.insertAdjacentElement('beforeEnd', div);

    removeElementDelay(div);
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
            <p>Would you like to bound this secondary key with the url?</p>`;
        showTipDialog(innerHtml, function() {
            chrome.runtime.sendMessage({save: true, key: pressedKey}, response => {
                showBoundSuccessTipDialog();
            });
        });
    },
    showSecondaryShortcutUnbound(pressedKey){
        let innerHtml = `<p>the secondary shortcut key <span id="as-injection-shortcut">ALT+${pressedKey}</span> 
                        not bound for this domain yet!</p><p>Would you like to bound this secondary key with the domain?</p>`;
        showTipDialog(innerHtml, function() {
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
        showTipDialog(innerHtml, null, false);
    }
}