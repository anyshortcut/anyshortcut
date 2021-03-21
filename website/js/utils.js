export default {
    openPopupWindow(event) {
        let width = 450, height = 600;
        let screenLeft = window.screenLeft ? window.screenLeft : screen.left,
            screenTop = window.screenTop ? window.screenTop : screen.top,
            innerWidth = window.innerWidth,
            innerHeight = window.innerHeight,
            left = parseInt(innerWidth / 2 - width / 2 + screenLeft),
            top = parseInt(innerHeight / 2 - height / 2 + screenTop);
        let windowFeatures = `width=${width},height=${height},top=${top},left=${left},
        resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=no`;
        let authWindow = window.open('/oauth/google', 'Anyshortcut', windowFeatures);
        authWindow.focus && authWindow.focus();

        // Add loading animation
        event.target.classList.add('is-loading');
    },
    createDiv(className) {
        let div = document.createElement('div');
        div.className = className;
        return div;
    }
}