module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended'
  ],
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: ['react'],
  rules: {
    'react/no-unescaped-entities': 'off',
    'react/prop-types': 'warn',
    'react/display-name': 'off',
    'prettier/prettier': ['warn', { endOfLine: 'auto' }],
    'no-unused-vars': 'warn',
    'no-empty': 'warn',
    'no-irregular-whitespace': 'warn', // Changé de error à warn
    'no-undef': 'warn' // Changé de error à warn
  },
  globals: {
    process: true,
    endpoint: 'readonly' // Ajouté pour éviter no-undef sur endpoint
  }
};
