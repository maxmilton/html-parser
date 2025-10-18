import js from "@eslint/js";
import mm from "@maxmilton/eslint-config";
import { defineConfig } from "eslint/config";
import unicorn from "eslint-plugin-unicorn";
import ts from "typescript-eslint";

export default defineConfig(
  js.configs.recommended,
  ts.configs.strictTypeChecked,
  ts.configs.stylisticTypeChecked,
  unicorn.configs.recommended,
  mm.configs.recommended,
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "no-plusplus": "off", // clearer code when used mindfully
      quotes: ["error", "double", { avoidEscape: true }],
      "unicorn/no-for-loop": "off", // used in performance critical loops
      "unicorn/prefer-at": "off", // bad browser support
      "unicorn/prefer-code-point": "off", // worse performance
      "unicorn/prefer-global-this": "off", // prefer to clearly separate Bun and DOM
      "unicorn/prefer-set-has": "warn", // not always faster
      "unicorn/prefer-spread": "off", // string spread slower than split("")
      "unicorn/switch-case-braces": ["error", "avoid"],
    },
  },
  { ignores: ["**/*.bak", "coverage", "dist"] },
);
