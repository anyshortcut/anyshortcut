function hideElementDelay(element, delay) {
    let timeoutId = window.setTimeout(() => {
        element.style.display = 'none';
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
    }, delay || 3000);
}

export default {
    showPrimaryShortcutUnbound(pressedKey){
        var elementId = 'inject-tips';
        var div = document.getElementById(elementId);
        if (div) {
            div.style.display = 'block';
        } else {
            div = document.createElement('div');
            div.id = elementId;
            div.className = 'as-injection-div';
            div.innerHTML = '<p>the shortcut key <span id="shortcut-key-span"></span> not bound for this domain yet!</p>' +
                '<p>Would you like to bound this secondary key with the url?</p>';
            div.firstChild.className = 'as-injection-p';

            var positiveButton = document.createElement('button');
            positiveButton.textContent = 'Yes';
            positiveButton.className = 'as-injection-button';
            positiveButton.onclick = () => {
                div.style.display = 'none';

                chrome.runtime.sendMessage({save: true, key: pressedKey}, response => {
                    var divTips = document.createElement('div');
                    divTips.className = 'as-injection-div';
                    divTips.innerHTML = 'Great! you bound the url with this key!';
                    document.body.insertAdjacentElement('beforeEnd', divTips);

                    hideElementDelay(divTips)
                });
            };
            div.appendChild(positiveButton);

            var negativeButton = document.createElement('button');
            negativeButton.textContent = 'No';
            negativeButton.className = 'as-injection-button';
            negativeButton.onclick = () => {
                div.style.display = 'none';
            };
            div.appendChild(negativeButton);
            document.body.insertAdjacentElement('beforeEnd', div);
        }

        var span = document.getElementById('shortcut-key-span');
        span.className = 'as-injection-shortcut';
        span.textContent = 'ALT+SHIFT+' + pressedKey;

        hideElementDelay(div);
    },
    showSecondaryShortcutUnbound(pressedKey){
        var elementId = 'secondary-inject-tips';
        var div = document.getElementById(elementId);
        if (div) {
            div.style.display = 'block';
        } else {
            div = document.createElement('div');
            div.id = elementId;
            div.className = 'as-injection-div';
            div.innerHTML = '<p>the secondary shortcut key <span id="secondary-shortcut-key-span"></span> not bound for this domain yet!</p>' +
                '<p>Would you like to bound this secondary key with the domain?</p>';
            div.firstChild.className = 'as-injection-p';

            var positiveButton = document.createElement('button');
            positiveButton.textContent = 'Yes';
            positiveButton.className = 'as-injection-button';
            positiveButton.onclick = () => {
                div.style.display = 'none';

                chrome.runtime.sendMessage(
                    {
                        secondarySave: true,
                        key: pressedKey,
                        comment: null,
                    }, response => {
                        var divTips = document.createElement('div');
                        divTips.className = 'as-injection-div';
                        divTips.innerHTML = 'Great! you bound the url with this key!';
                        document.body.insertAdjacentElement('beforeEnd', divTips);

                        hideElementDelay(divTips)
                    });
            };
            div.appendChild(positiveButton);

            var negativeButton = document.createElement('button');
            negativeButton.textContent = 'No';
            negativeButton.className = 'as-injection-button';
            negativeButton.onclick = () => {
                div.style.display = 'none';
            };
            div.appendChild(negativeButton);
            document.body.insertAdjacentElement('beforeEnd', div);
        }

        var span = document.getElementById('secondary-shortcut-key-span');
        span.className = 'as-injection-shortcut';
        span.textContent = 'ALT+' + pressedKey;

        hideElementDelay(div);
    },
    showQuickSecondaryShortcutFailed(primaryPressedKey, secondaryPressedKey){
        var elementId = 'quick-secondary-inject-tips';
        var div = document.getElementById(elementId);
        if (div) {
            div.style.display = 'block';
        } else {
            div = document.createElement('div');
            div.id = elementId;
            div.className = 'as-injection-div';
            div.innerHTML = '<p>the quick secondary shortcut key ' +
                '<span id="quick-secondary-shortcut-key-span"></span> not bound yet!</p>';
            div.firstChild.className = 'as-injection-p';

            document.body.insertAdjacentElement('beforeEnd', div);
        }

        var span = document.getElementById('quick-secondary-shortcut-key-span');
        span.className = 'as-injection-shortcut';
        span.textContent = 'SHIFT+ALT+' + primaryPressedKey + '→' + secondaryPressedKey;

        hideElementDelay(div, 2000);
    }
}