var p = document.getElementById('key-code-char');
var pressedKey = p.textContent;

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

function hideElementDelay(element, delay) {
    var timeoutId = window.setTimeout(() => {
        element.style.display = 'none';
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
    }, delay || 3000);
}
