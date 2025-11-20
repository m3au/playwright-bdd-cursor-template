import cspell from '@cspell/eslint-plugin';
import eslint from '@eslint/js';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import html from '@html-eslint/eslint-plugin';
import htmlParser from '@html-eslint/parser';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import noSecrets from 'eslint-plugin-no-secrets';
import perfectionist from 'eslint-plugin-perfectionist';
import playwright from 'eslint-plugin-playwright';
// @ts-expect-error - No type definitions available
import promise from 'eslint-plugin-promise';
import regexp from 'eslint-plugin-regexp';
// @ts-expect-error - No type definitions available
import security from 'eslint-plugin-security';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import yml from 'eslint-plugin-yml';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/coverage/**',
      '**/test-output/**',
      '**/.env*',
      '**/.DS_Store',
      '**/Thumbs.db',
      '**/*.sh',
      '**/.actrc',
      '**/.husky/_/**',
      '.cursor/rules/**/*.mdc', // Ignore .mdc rule files - @eslint/markdown v7.5.1 doesn't support YAML frontmatter parsing
    ],
  },
  {
    files: ['**/*.ts'],
    ignores: ['tests/unit/**/*.test.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        project: false,
      },
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      playwright: playwright,
      sonarjs: sonarjs,
      unicorn: unicorn,
      cspell: cspell,
      import: importPlugin,
      promise: promise,
      regexp: regexp,
      security: security,
      'no-secrets': noSecrets,
      perfectionist: perfectionist,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
      'import/ignore': ['^bun:'],
    },
    ...eslint.configs.recommended,
    rules: {
      ...sonarjs.configs.recommended.rules,
      ...unicorn.configs.recommended.rules,
      'cspell/spellchecker': ['warn', { checkComments: true, checkStrings: true }],
      ...playwright.configs['flat/recommended'].rules,
      ...importPlugin.configs.recommended.rules,
      'import/no-unresolved': ['error', { ignore: ['^bun:'] }],
      ...promise.configs.recommended.rules,
      ...regexp.configs.recommended.rules,
      ...security.configs.recommended.rules,
      // Security exceptions for scripts - controlled file operations
      'security/detect-non-literal-fs-filename': 'off',
      // Security exceptions - simple regex patterns for version matching, not user input
      'security/detect-unsafe-regex': 'off',
      // Security exceptions - object property access with controlled keys
      'security/detect-object-injection': 'off',
      // Security exceptions - regex with controlled variables in test contexts
      'security/detect-non-literal-regexp': 'off',
      'no-secrets/no-secrets': 'error',
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      // Perfectionist: enhance import sorting (complements import/order)
      'perfectionist/sort-imports': 'off', // Use import/order instead
      'perfectionist/sort-named-imports': 'off', // Use import/order instead
    },
  },
  {
    files: ['tests/unit/**/*.test.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        project: false,
      },
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      sonarjs: sonarjs,
      unicorn: unicorn,
      cspell: cspell,
      import: importPlugin,
      promise: promise,
      regexp: regexp,
      perfectionist: perfectionist,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
      'import/ignore': ['^bun:'],
    },
    ...eslint.configs.recommended,
    rules: {
      ...sonarjs.configs.recommended.rules,
      ...unicorn.configs.recommended.rules,
      'cspell/spellchecker': ['warn', { checkComments: true, checkStrings: true }],
      ...importPlugin.configs.recommended.rules,
      'import/no-unresolved': ['error', { ignore: ['^bun:'] }],
      ...promise.configs.recommended.rules,
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      // Perfectionist: enhance import sorting (complements import/order)
      'perfectionist/sort-imports': 'off', // Use import/order instead
      'perfectionist/sort-named-imports': 'off', // Use import/order instead
    },
  },
  ...yml.configs['flat/recommended'],
  ...yml.configs['flat/prettier'],
  {
    files: ['**/*.yml', '**/*.yaml'],
    plugins: {
      cspell: cspell,
    },
    rules: {
      'cspell/spellchecker': ['warn', { checkComments: true, checkStrings: true }],
    },
  },
  {
    files: ['**/*.md', '**/*.mdc'],
    ...markdown.configs.recommended[0],
    plugins: {
      ...markdown.configs.recommended[0]?.plugins,
      cspell: cspell,
    },
    rules: {
      ...markdown.configs.recommended[0]?.rules,
      'cspell/spellchecker': ['warn', { checkComments: true, checkStrings: true }],
    },
  },
  {
    files: ['**/*.mdc'],
    rules: {
      'markdown/MD004': 'off', // Allow + for positive actions per rules.mdc
    },
  },
  {
    files: ['CHANGELOG.md'],
    rules: {
      'markdown/no-missing-label-refs': 'off',
    },
  },
  {
    files: ['**/*.json'],
    language: 'json/json',
    plugins: {
      ...json.configs.recommended.plugins,
      cspell: cspell,
    },
    rules: {
      ...json.configs.recommended.rules,
      'cspell/spellchecker': ['warn', { checkComments: true, checkStrings: true }],
    },
  },
  {
    files: ['**/*.jsonc'],
    language: 'json/jsonc',
    plugins: {
      ...json.configs.recommended.plugins,
      cspell: cspell,
    },
    rules: {
      ...json.configs.recommended.rules,
      'cspell/spellchecker': ['warn', { checkComments: true, checkStrings: true }],
    },
  },
  {
    files: ['**/*.html'],
    plugins: {
      html: html,
      cspell: cspell,
    },
    languageOptions: {
      parser: htmlParser,
    },
    rules: {
      ...html.configs.recommended.rules,
      'html/indent': 'off',
      'html/require-closing-tags': 'off',
      'html/no-extra-spacing-attrs': 'off',
      'html/attrs-newline': 'off',
      'cspell/spellchecker': ['warn', { checkComments: true, checkStrings: true }],
    },
  },
];
