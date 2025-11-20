import type { Config } from 'prettier';

const config: Config = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  endOfLine: 'lf',
  arrowParens: 'always',
  bracketSpacing: true,
  overrides: [
    {
      files: ['*.json', '*.jsonc'],
      options: {
        trailingComma: 'none',
      },
    },
    {
      files: ['*.html'],
      options: {
        parser: 'html',
      },
    },
  ],
};

export default config;
