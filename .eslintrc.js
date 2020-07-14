module.exports = {
  root: true,
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  globals: {
    exports: true,
    require: true,
  },
  plugins: ['node'],
  extends: ['eslint:recommended', 'plugin:node/recommended-module'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
};
