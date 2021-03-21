import utils from "./utils.js";

const signInForm = require('%/common/sign-in-form.html');
document.querySelector('.subscribe-button').addEventListener('click', onSubscribeButtonClick, false);

window.addEventListener('message', receiveWindowMessage, false);

function isUserLoggedIn() {
    // querySelectorAll() return NodeList object which implements Iterator interface,
    // hence we can spread it to a array
    let elements = document.querySelectorAll('a.nav-menu-item');
    for (let element of [...elements]) {
        if (element.textContent === 'Account') {
            return true;
        }
    }
    return false;
}

function onSubscribeButtonClick() {
    if (isUserLoggedIn()) {
        window.location.href = '/account';
    } else {
        let modal = utils.createDiv('sign-in-form-modal');
        modal.innerHTML = signInForm;
        modal.addEventListener('click', event => {
            if (event.target === modal) {
                // Auto remove modal self when overlay click.
                modal.remove();
            }
        });
        document.body.insertAdjacentElement('beforeEnd', modal);

        document.querySelector('.btn-google-sign-in')
            .addEventListener('click', utils.openPopupWindow, false);
    }
}

function receiveWindowMessage(event) {
    if (event.data.action === 'logged-in') {
        // Auto jump to account page after user logged in
        window.location.href = '/account#/subscription';
    }
}