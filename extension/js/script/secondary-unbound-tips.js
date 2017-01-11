var divStyle = `
    background: #ffffff;
    padding: 20px;
    margin: 0 auto;
    position: fixed;
    text-align: center;
    top:10px;
    left: 0;
    right:0;
    border:2px solid #dd4814;
    width: fit-content;
    z-index: 99999;
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

var p = document.getElementById('key-code-char');
var pressedKey = p.textContent;

var elementId = 'secondary-inject-tips';
var div = document.getElementById(elementId);
if (div) {
    div.style.display = 'block';
} else {
    div = document.createElement('div');
    div.id = elementId;
    div.style = divStyle;
    div.innerHTML = '<p>the secondary shortcut key <span id="shortcut-key-span"></span> not bound for this domain yet!</p>' +
        '<p>Would you like to bound this secondary key with the domain?</p>';
    div.firstChild.style = pStyle;

    var positiveButton = document.createElement('button');
    positiveButton.textContent = 'Yes';
    positiveButton.style = buttonStyle;
    positiveButton.onclick = () => {
        div.style.display = 'none';

        chrome.runtime.sendMessage(
            {
                secondarySave: true,
                key: pressedKey,
                comment: null,
            }, response => {
                var divTips = document.createElement('div');
                divTips.style = divStyle;
                divTips.innerHTML = 'Great! you bound the url with this key!';
                document.body.insertAdjacentElement('beforeEnd', divTips);

                hideElementDelay(divTips)
            });
    };
    div.appendChild(positiveButton);

    var negativeButton = document.createElement('button');
    negativeButton.textContent = 'No';
    negativeButton.style = buttonStyle;
    negativeButton.onclick = () => {
        div.style.display = 'none';
    };
    div.appendChild(negativeButton);
    document.body.insertAdjacentElement('beforeEnd', div);
}

var span = document.getElementById('shortcut-key-span');
span.style = shortcutKeyStyle;
span.textContent = 'ALT+' + pressedKey;

function hideElementDelay(element, delay) {
    var timeoutId = window.setTimeout(() => {
        element.style.display = 'none';
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
    }, delay || 3000);
}
