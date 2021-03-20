# Anyshortcut

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/ginilcdjefkbpeelgekodpmmabppcfao.svg)](https://chrome.google.com/webstore/detail/anyshortcut/ginilcdjefkbpeelgekodpmmabppcfao)
[![Mozilla Add-on](https://img.shields.io/amo/v/anyshortcut-firefox?color=%2320123A)](https://addons.mozilla.org/en-US/firefox/addon/anyshortcut-firefox/)
[![license-apache](https://img.shields.io/badge/license-Apache-yellow.svg)](https://github.com/anyshortcut/anyshortcut/blob/master/LICENSE)

Forget mouse clicks, embrace shortcuts! Customize keyboard shortcuts for your frequently visited websites.

https://anyshortcut.com

## Installation

- [Chrome Web Store](https://chrome.google.com/webstore/detail/anyshortcut/ginilcdjefkbpeelgekodpmmabppcfao)

- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/anyshortcut-firefox/)

## Contribution

```shell
$ git clone git@github.com:anyshortcut/anyshortcut.git
Cloning into 'anyshortcut'...

$ cd anyshortcut

$ tree -L 1  
.
├── README.md
├── build # The Webpack build directory
├── extension # The destination directory build from Webpack for the whole extension.
├── manifest # Generate platform-specific manifest.json respectively.
├── package-lock.json
├── package.json
├── src # The source code directory of Anyshortcut

$ npm install

$ npm run build_production # For Chromium

$ npm run build_production:firefox # For Firefox
```

The **extension/** directory is the destination directory of extension.
