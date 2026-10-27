import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  { ignores: ["dist/", "coverage/"] },
  js.configs.recommended,
  {
    files: ["src/**/*.{js,jsx}"],
    ...react.configs.flat.recommended,
    languageOptions: {
      ...react.configs.flat.recommended.languageOptions,
      globals: globals.browser,
    },
    settings: { react: { version: "detect" } },
  },
  { files: ["src/**/*.{js,jsx}"], ...react.configs.flat["jsx-runtime"] },
  { files: ["src/**/*.{js,jsx}"], ...reactHooks.configs.flat.recommended },
  { files: ["src/**/*.{js,jsx}"], ...jsxA11y.flatConfigs.recommended },
  {
    files: ["server/**/*.js", "*.config.js"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["**/*.test.{js,jsx}", "src/test/**/*.js"],
    languageOptions: { globals: { ...globals.node } },
  },
];
