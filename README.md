# Anyshortcut

A productive browser plugin to help you customize keyboard shortcuts to open frequently visited websites instantly.

## Custom build lodash

### lodash include command

Reference: [https://lodash.com/custom-builds](https://lodash.com/custom-builds)

```shell
npm i -g  lodash
lodash include=isEmpty,pickBy,extend,escape,cloneDeep,forOwn,forEach,debounce,throttle -p -o src/js/vendor/lodash.includes.min.js
```

then configure in webpack config file,

    resolve: {
        alias: {
            'lodash$': path.join(__dirname, '..', 'src/js/vendor/lodash.includes.min.js'),
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

## Build instructions for extension's reviewers

> Step **Custom build lodash** is prerequisite.

### Operating system used for the build

macOS, Windows, Linux

### Node version

v9.3.0+

### How to build

- `npm install`

- `npm run build_production:firefox`

the **extension/** directory is the destination directory of extension.

That's it!
