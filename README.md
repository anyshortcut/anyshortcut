# Anyshortcut

A productive browser plugin to help you customize keyboard shortcuts to open frequently visited websites instantly.

## Build instructions for extension's reviewers

### Operating system used for the build

macOS, Windows, Linux

### Node version

v9.3.0

### How to build

- `npm install`

- `npm run build_production:firefox`

the **extension\\** directory is the destination directory of extension.

That's it!


### Custom build lodash
Reference: [https://lodash.com/custom-builds](https://lodash.com/custom-builds)

```shell
npm i -g  lodash
lodash include=isEmpty,pickBy,template,cloneDeep,forOwn,forEach
```

rename the destination file to *lodash.includes.min.js*, then configure in webpack config file,

    resolve: {
        alias: {
            'lodash$': path.join(__dirname, '..', 'src/js/vendor/lodash.includes.min.js'),
        }
    }
