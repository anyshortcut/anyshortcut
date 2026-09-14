module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    webextensions: true,
  },
  extends: ['eslint:recommended', '@vue/eslint-config-prettier', 'plugin:vue/vue3-essential'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': 'off',
    // The TS-aware rule understands type-only usage; the base rule does not.
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  overrides: [
    {
      // TypeScript resolves identifiers itself, including type-only ones such
      // as RequestInit that no-undef cannot see.
      files: ['*.ts', '*.vue'],
      rules: { 'no-undef': 'off' },
    },
  ],
  globals: {
    chrome: 'readonly',
  },
  ignorePatterns: ['website/**/*', 'extension/**/*'],
};
