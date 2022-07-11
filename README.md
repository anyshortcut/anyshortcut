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

## Custom build lodash

### lodash include command

Reference: [https://lodash.com/custom-builds](https://lodash.com/custom-builds)

```shell
npm i -g lodash-cli
lodash include=isEmpty,pickBy,extend,escape,cloneDeep,forOwn,forEach,debounce,throttle,sortBy -p -o src/js/vendor/lodash.includes.js
```

then configure in webpack config file,

    resolve: {
        alias: {
            'lodash$': path.join(__dirname, '..', 'src/js/vendor/lodash.includes.js'),
        }
    }


### Precompile lodash templates to avoid use `unsafe-eval`

There is an awesome way to precompile templates by [custom build](https://lodash.com/custom-builds).

> Use the template command to pass the file path pattern used to match template files to precompile.

> **Note**: Precompiled templates are assigned to the` _.templates` object.
```
lodash template="./*.jst"
```

`
lodash settings="{variable:'data'}"  template="./src/templates/*.html" -d -o src/js/script/templates.js
`
