### Precompile lodash templates to avoid use `unsafe-eval`

There is an awesome way to precompile templates by [custom build](https://lodash.com/custom-builds).

> Use the template command to pass the file path pattern used to match template files to precompile.

> **Note**: Precompiled templates are assigned to the` _.templates` object.

```
lodash settings="{variable:'data'}"  template="./src/templates/*.html" -d -o src/js/script/templates.js
```