module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  env: {
    // es6: true,
    // browser: true,
    // node: true
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended"
  ],
  plugins: [
    "@typescript-eslint",
    "react-hooks",
  ],
  parserOptions: {
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    "no-undef": "off",
    "no-restricted-globals": "off",
    "no-unused-vars": "off",
    "no-unused-labels": "warn",
    "react/display-name": "off",
    "react/prop-types": "off",
    "no-console": "off",
    "react-hooks/rules-of-hooks": "error",
    // "react-hooks/exhaustive-deps": "warn"
  },
  settings: {
    react: {
      version: "16.8.6"
    }
  }
}