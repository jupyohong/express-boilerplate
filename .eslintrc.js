module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2020,
  },
  env: {
    node: true,
    browser: false,
    es6: true,
  },
  extends: ['plugin:prettier/recommended'],
  plugins: ['prettier'],
  ignorePatterns: ['xmldoc_2.2.4.js'],
  rules: {
    'no-console': 'off',
    quotes: [2, 'single'],
    'prettier/prettier': [
      'error',
      {
        trailingComma: 'es5',
        tabWidth: 2,
        semi: true,
        singleQuote: true,
        bracketSpacing: true,
        arrowParens: 'avoid',
        endOfLine: 'auto',
      },
    ],
  },
};
