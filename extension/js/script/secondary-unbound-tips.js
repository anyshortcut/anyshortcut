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

var p = document.getElementById('key-code-char');
var pressed_key = p.textContent;

var div = document.getElementById('inject-tips');
if (div) {
    div.style.display = 'block';
} else {
    div = document.createElement('div');
    div.id = 'inject-tips';
    div.style = divStyle;
    div.innerHTML = '<p>the shortcut key <span id="shortcut-key-span"></span> not bound any url yet!</p>' +
        '<p>Would you like to bound this key with the url?</p>';
    div.firstChild.style = pStyle;

    var positive_button = document.createElement('button');
    positive_button.textContent = 'Yes';
    positive_button.style = buttonStyle;
    positive_button.onclick = () => {
        div.style.display = 'none';

        // TODO check current page url whether bound?
        chrome.runtime.sendMessage(
            {
                secondarySave: true,
                key: pressed_key,
                value: {}
            }, response => {
                var div_tips = document.createElement('div');
                div_tips.style = divStyle;
                div_tips.innerHTML = 'Great! you bound the url with this key!';
                document.body.insertAdjacentElement('beforeEnd', div_tips);

                hideElementDelay(div_tips)
            });
    };
    div.appendChild(positive_button);

    var negative_button = document.createElement('button');
    negative_button.textContent = 'No';
    negative_button.style = buttonStyle;
    negative_button.onclick = () => {
        div.style.display = 'none';
    };
    div.appendChild(negative_button);
    document.body.insertAdjacentElement('beforeEnd', div);
}

var span = document.getElementById('shortcut-key-span');
span.style = shortcutKeyStyle;
span.textContent = 'ALT+SHIFT+' + pressed_key;

function hideElementDelay(element, delay) {
    var timeoutId = window.setTimeout(() => {
        element.style.display = 'none';
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
    }, delay || 3000);
}
