var divStyle = `
    background: #eeeeee;
    padding: 20px;
    margin: 0 auto;
    position: fixed;
    text-align: center;
    top:10px;
    left: 0;
    right:0;
    width: fit-content;
    z-index: 500;
`;

var pStyle = `
    font-size:18px;
    color:blue;
`;

var buttonStyle = `
    float: right;
    color: #dd4814;
    padding:5px;
`;

var shortcutKeyStyle = `
    font-weight=bold;
    color: #dd4814;
`;

var div = document.getElementById('inject-tips');
if (div) {
    div.style.display = 'block';
    hideElementDelay(div);
} else {
    div = document.createElement('div');
    div.id = 'inject-tips';
    div.style = divStyle;
    div.innerHTML = '<p>the shortcut key <span id="shortcut-key-span"></span> not bound any url yet!</p>';
    div.firstChild.style = pStyle;
    var button = document.createElement('button');
    button.textContent = 'Got it';
    button.style = buttonStyle;
    button.onclick = () => {
        div.style.display = 'none';
    };
    div.appendChild(button);
    document.body.insertAdjacentElement('beforeEnd', div);
    hideElementDelay(div);
}

var p = document.getElementById('key-code-char');
var span = document.getElementById('shortcut-key-span');
span.style = shortcutKeyStyle;
span.textContent = 'ALT+SHIFT+' + p.textContent;

function hideElementDelay(element, delay) {
    var timeoutId = window.setTimeout(() => {
        element.style.display = 'none';
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
    }, delay || 3000);
}
