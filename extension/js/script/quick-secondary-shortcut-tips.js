var p = document.getElementById('key-code-char');
var pressedKey = p.textContent;

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
span.textContent = 'SHIFT+ALT+' + pressedKey;

hideElementDelay(div, 2000);

function hideElementDelay(element, delay) {
    var timeoutId = window.setTimeout(() => {
        element.style.display = 'none';
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
    }, delay || 3000);
}
