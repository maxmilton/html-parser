import eslint from '@eslint/js';
import mm from '@maxmilton/eslint-config';
import unicorn from 'eslint-plugin-unicorn';
import ts from 'typescript-eslint';

const OFF = 0;
const WARN = 1;
const ERROR = 2;

export default ts.config(
  eslint.configs.recommended,
  ...ts.configs.strictTypeChecked,
  ...ts.configs.stylisticTypeChecked,
  unicorn.configs['flat/recommended'],
  mm.configs.recommended,
  {
    linterOptions: {
      reportUnusedDisableDirectives: ERROR,
    },
    languageOptions: {
      parserOptions: {
        project: ['tsconfig.json', 'tsconfig.node.json'],
        projectService: {
          allowDefaultProject: ['*.mjs'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // bad browser support
      'unicorn/prefer-at': OFF,
      // prefer to clearly separate Bun and DOM
      'unicorn/prefer-global-this': OFF,

      /* Performance and byte savings */
      'no-plusplus': OFF,
      // not always faster
      'unicorn/prefer-set-has': WARN,
      // used in performance critical loops
      'unicorn/no-for-loop': OFF,
      // worse performance
      'unicorn/prefer-code-point': OFF,
      // string spread is slower than split('')
      'unicorn/prefer-spread': OFF,
      'unicorn/switch-case-braces': [ERROR, 'avoid'],
    },
  },
  {
    ignores: ['*.bak', 'coverage/**', 'dist/**'],
  },
);
