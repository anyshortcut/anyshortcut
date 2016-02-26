var divStyle = `
    background: #eeeeee;
    color: #dd4814;
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

var buttonStyle = `
    float: right;
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
    div.insertAdjacentHTML('afterBegin', '<h3>the shortcut key not bound any url yet!</h3>');
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

function hideElementDelay(element, delay) {
    var timeoutId = window.setTimeout(() => {
        element.style.display = 'none';
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
    }, delay || 3000);
}
