module.exports = {
    plugins: ["prettier"],
    env: {
      browser: true,
      es2020: true,
    },
    parserOptions: {
      ecmaVersion: 11,
      sourceType: "module",
    },
    ignorePatterns: ["/*.js", "/dist"],
    rules: {},
    extends: ["eslint:recommended", "plugin:prettier/recommended"],
  };