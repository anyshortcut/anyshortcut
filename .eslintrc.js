module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    webextensions: true,
  },
  extends: ['eslint:recommended', '@vue/eslint-config-prettier', 'plugin:vue/vue3-essential'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': 'off',
  },
  globals: {
    chrome: 'readonly',
  },
  ignorePatterns: ['website/**/*', 'build/**/*', 'extension/**/*']
};
