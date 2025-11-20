# Code Quality Files Reference <!-- omit from toc -->

This document describes all code quality configuration files in the project and what they do.

![Placeholder](https://placecats.com/millie/800/300)

## Table of Contents <!-- omit from toc -->

- [Overview](#overview)
  - [Quality Check Commands](#quality-check-commands)
- [Linting \& Formatting](#linting--formatting)
  - [`eslint.config.ts`](#eslintconfigts)
  - [`prettier.config.ts`](#prettierconfigts)
  - [`.lintstagedrc.json`](#lintstagedrcjson)
  - [`.markdownlint.jsonc`](#markdownlintjsonc)
- [Type Checking](#type-checking)
  - [`tsconfig.json`](#tsconfigjson)
- [Unit Testing](#unit-testing)
- [Spell Checking](#spell-checking)
  - [`.cspell.jsonc`](#cspelljsonc)
- [Shell Script Linting](#shell-script-linting)
  - [ShellCheck](#shellcheck)
- [Editor Configuration](#editor-configuration)
  - [`.editorconfig`](#editorconfig)
  - [`.gitattributes`](#gitattributes)
- [IDE Integration](#ide-integration)
- [Git Hooks (`.husky/`) Workflow](#git-hooks-husky-workflow)
  - [`.husky/pre-commit`](#huskypre-commit)
  - [`.husky/commit-msg`](#huskycommit-msg)
  - [`.husky/prepare-commit-msg`](#huskyprepare-commit-msg)
  - [`.husky/pre-push`](#huskypre-push)

---

## Overview

Code quality tools enforce consistent standards, catch errors early, and maintain code maintainability. The project uses a layered approach combining linting, formatting, type checking, and spell checking to ensure all code meets quality standards before it reaches the repository.

| Tool         | Configuration File    | Purpose              | Runs On             |
| ------------ | --------------------- | -------------------- | ------------------- |
| ESLint       | `eslint.config.ts`    | Code linting         | Commit, manually    |
| ShellCheck   | (none)                | Shell script linting | Commit, manually    |
| Markdownlint | `.markdownlint.jsonc` | Markdown linting     | Commit, manually    |
| Prettier     | `prettier.config.ts`  | Code formatting      | Commit, manually    |
| lint-staged  | `.lintstagedrc.json`  | Staged file linting  | Commit              |
| TypeScript   | `tsconfig.json`       | Type checking        | Push, manually, IDE |
| CSpell       | `.cspell.jsonc`       | Spell checking       | Commit (via ESLint) |
| Bun Test     | `bunfig.toml`         | Unit tests           | Commit, CI/CD       |
| Husky        | `.husky/`             | Git hooks            | Commit, push        |

### Quality Check Commands

These scripts offer granular control over local quality checks:

- `bun lint`: Run all quality checks: **TypeScript** → **ESLint** → **ShellCheck**
- `bun lint:fix`: **Auto-fix** ESLint errors (TS, Markdown)
- `bun lint:typescript`: **TypeScript type checking only**
- `bun lint:eslint`: **ESLint only** (TS, Markdown, YAML, .mdc)
- `bun lint:markdown`: **Markdown linting only**
- `bun lint:shellcheck`: **ShellCheck only** (on Husky git hooks)
- `bun test`: Run **unit tests**

Automated checks run on every commit via Git hooks, providing immediate feedback. All tools can also be run manually for local development and CI/CD pipelines.

## Linting & Formatting

### [`eslint.config.ts`](../eslint.config.ts)

**Purpose**: ESLint configuration for code linting and quality checks.

**What it does**:

- Configures ESLint with TypeScript support using flat config format
- Integrates multiple ESLint plugins for comprehensive code quality
- Defines rules for TypeScript, JSON, HTML, YAML, Markdown, and `.mdc` files
- Lints Cursor AI rules in `.cursor/rules/*.mdc` using markdown processor
- Uses unified config for TypeScript files
- Sets up ignores for build artifacts and generated files

**Integrated ESLint Plugins**:

- [`@typescript-eslint/eslint-plugin`](https://typescript-eslint.io/) - TypeScript linting and type-aware analysis
- [`eslint-plugin-sonarjs`](https://github.com/SonarSource/eslint-plugin-sonarjs) - Code quality and bug detection (includes cognitive complexity analysis)
- [`eslint-plugin-unicorn`](https://github.com/sindresorhus/eslint-plugin-unicorn) - JavaScript best practices and modern patterns
- [`@cspell/eslint-plugin`](https://github.com/streetsidesoftware/vscode-spell-checker/tree/main/packages/%40cspell/eslint-plugin) - Spell checking (checks comments and strings)
- [`eslint-plugin-playwright`](https://github.com/playwright-community/eslint-plugin-playwright) - Playwright-specific rules and globals (applies to all TypeScript files)
- [`eslint-plugin-import`](https://github.com/import-js/eslint-plugin-import) - Import/export validation and ordering
- [`eslint-plugin-promise`](https://github.com/eslint-community/eslint-plugin-promise) - Promise best practices and error handling
- [`eslint-plugin-security`](https://github.com/eslint-community/eslint-plugin-security) - Security vulnerability detection
- [`eslint-plugin-regexp`](https://github.com/ota-meshi/eslint-plugin-regexp) - Regular expression pattern validation
- [`eslint-plugin-no-secrets`](https://github.com/nickdeis/eslint-plugin-no-secrets) - Secret detection in code
- [`eslint-plugin-perfectionist`](https://github.com/azat-io/eslint-plugin-perfectionist) - Code organization and sorting (complements import/order)
- [`eslint-plugin-yml`](https://github.com/ota-meshi/eslint-plugin-yml) - YAML linting for GitHub Actions workflows and config files
- [`@eslint/markdown`](https://github.com/eslint/markdown) - Official ESLint plugin for linting Markdown files (including `.mdc`)
- [`@eslint/json`](https://github.com/eslint/json) - Official ESLint plugin for linting JSON and JSONC files
- [`@html-eslint/eslint-plugin`](https://github.com/yeonjuan/html-eslint) - HTML linting for template files

File-specific configurations apply different plugin sets to TypeScript, YAML, and Markdown files. See [`eslint.config.ts`](../eslint.config.ts) for details.

### [`prettier.config.ts`](../prettier.config.ts)

**Purpose**: Prettier configuration for automatic code formatting.

**What it does**:

- Sets formatting rules (semicolons, quotes, line width, etc.)
- Configures file-specific overrides (JSON files)
- Ensures consistent code style across the project

### [`.lintstagedrc.json`](../.lintstagedrc.json)

**Purpose**: Configures which files are linted/formatted on commit.

**What it does**:

- Runs ESLint and Prettier on staged `.ts` files
- Runs ESLint and Prettier on staged `.md` files
- Runs ESLint and Prettier on staged `.json` and `.jsonc` files
- Runs ESLint and Prettier on staged `.yml` files
- Runs ESLint and Prettier on staged `.html` files
- Runs Prettier on staged `.toml` files
- Runs ShellCheck on staged `.husky/` git hook files
- Only processes files that are staged for commit (performance optimization)
- Enforces zero warnings (`--max-warnings=0`) - fails on any ESLint warnings

### [`.markdownlint.jsonc`](../.markdownlint.jsonc)

**Purpose**: Markdownlint configuration for markdown file linting.

**What it does**:

- Configures markdownlint rules for consistent markdown formatting
- Enforces heading styles, list formatting, and blank line rules
- Validates link fragments and reference definitions
- Ensures code blocks have language specified

## Type Checking

### [`tsconfig.json`](../tsconfig.json)

**Purpose**: TypeScript compiler configuration.

**What it does**:

- Configures TypeScript compilation options
- Enables strict type checking
- Sets module resolution and target
- Configures decorator support for playwright-bdd
- Defines includes/excludes for type checking

> Run `bun lint:typescript` to verify types without building.

## Unit Testing

The project uses Bun's built-in test runner for unit testing utility functions. Unit tests achieve **100% code coverage** for all utility modules in `tests/utils/`.

**Test Structure**:

- **Test files**: Located in `tests/unit/` directory (`*.test.ts` files)
- **Configuration**: The `bunfig.toml` file is configured with `root = "tests/unit"`, which ensures that simply running `bun test` **only executes unit tests**, keeping them separate from the Playwright E2E suites
- **Coverage**: Enabled by default via `bunfig.toml`, reports function and line coverage
- **Coverage exclusions**: `tests/utils/decorators.ts` excluded from coverage due to Bun's tooling limitations with decorators
- **Covered modules**: All utility modules in `tests/utils/` (attachments, browser-project, bug-reporter, decorators, environment, format, locators, network, pagination, random) and all scripts in `scripts/` (bump-version, changelog, lint, pin-versions, update-coverage-badge)

**Running Tests**:

```shell
# Run unit tests (bunfig.toml sets root = "tests/unit", so just "bun test" works)
bun test
```

> Unit tests are separate from E2E tests (Playwright). Unit tests focus on testing pure utility functions, while E2E tests validate end-to-end workflows.

## Spell Checking

### [`.cspell.jsonc`](../.cspell.jsonc)

**Purpose**: CSpell configuration for spell checking.

**What it does**:

- Configures dictionaries for multiple languages and domains
- Defines project-specific words (brand names, technical terms)
- Sets up regex patterns to ignore (URLs, selectors, etc.)
- Ignores build artifacts and node_modules
- Integrated with ESLint via `@cspell/eslint-plugin`

**Configured Dictionaries**:

Includes standard dictionaries (`en_US`, `typescript`, `node`, `npm`, `html`, `css`) plus:

- `de-de` - German language support
- `software-terms` - General software development terms

Project-specific words and regex patterns are defined in [`.cspell.jsonc`](../.cspell.jsonc).

## Shell Script Linting

### ShellCheck

**Purpose**: Static analysis and linting for shell scripts.

**What it does**:

- Lints all shell scripts in `.husky/` directory (git hooks)
- Catches common shell scripting errors and anti-patterns
- Validates shell syntax and best practices
- Provides warnings for potential bugs and security issues
- Automatically discovers all shell scripts (no hardcoded file list)

**Scripts Checked**:

- `.husky/pre-commit` - Pre-commit quality checks
- `.husky/commit-msg` - Commit message validation
- `.husky/prepare-commit-msg` - Automatic version bumping
- `.husky/pre-push` - TypeScript type checking gate

ShellCheck runs as part of the main `bun lint` command alongside TypeScript and ESLint. Run `bun lint:shellcheck` to check shell scripts only.

## Editor Configuration

### [`.editorconfig`](../.editorconfig)

**Purpose**: Editor configuration for consistent formatting.

**What it does**:

- Ensures consistent file formatting across editors
- Sets UTF-8 charset and LF line endings
- Configures 2-space indentation
- Trims trailing whitespace (except markdown files)
- Inserts final newline
- Works with most modern editors

> Complements Prettier configuration.

### [`.gitattributes`](../.gitattributes)

**Purpose**: Git attributes for consistent file handling and line endings.

**What it does**:

- Ensures LF line endings for all text files (prevents CRLF issues)
- Auto-detects text files and normalizes line endings (`text=auto eol=lf`)
- Explicitly marks source code files as text (`.ts`, `.js`, `.json`, `.jsonc`, `.md`)
- Marks binary files appropriately (images, fonts) to prevent corruption
- Treats SVG files as text for version control

> Works with EditorConfig to ensure consistent line endings across all environments and Git operations.

## IDE Integration

Code quality tools integrate with IDEs through workspace settings and extensions. For detailed editor setup and recommended extensions, see [Editor Integration](../docs/development.md#code-quality) in the development documentation.

## Git Hooks (`.husky/`) Workflow

Husky enforces project quality gates at key stages of the Git workflow. These hooks work together to maintain code quality, enforce commit standards, and automate versioning.

| Hook Name              | File                        | Trigger Event        | Primary Action & Gate                                                                                               |
| :--------------------- | :-------------------------- | :------------------- | :------------------------------------------------------------------------------------------------------------------ |
| **Pre-Commit**         | `.husky/pre-commit`         | `git commit`         | Runs **unit tests**, updates **coverage badge**, and **lint-staged** (ESLint, Prettier, ShellCheck) on staged files |
| **Commit-Msg**         | `.husky/commit-msg`         | Commit message saved | Validates **Conventional Commits** format                                                                           |
| **Prepare-Commit-Msg** | `.husky/prepare-commit-msg` | Before editor opens  | Executes scripts to **auto-bump version** and **generate changelog** based on commit type                           |
| **Pre-Push**           | `.husky/pre-push`           | `git push`           | Runs **full TypeScript type checking** (`bun run lint:typescript`)                                                  |

---

### `.husky/pre-commit`

**Purpose**: The primary quality gate. Prevents commits with failing unit tests or immediate code quality issues.

**Key Actions**:

1. Runs **unit tests** (`bun test`)
2. Updates **coverage badge** in README.md (`bun scripts/update-coverage-badge.ts`)
3. Runs **lint-staged** on staged files for fast, focused checks:
   - ESLint + Prettier on `.ts`, `.md` files
   - Prettier on `.json`, `.yml`, `.html`, etc.
   - ShellCheck on `.husky/` git hook files

> See [`.husky/pre-commit`](../.husky/pre-commit) for the actual hook file. Requires Husky to be installed and configured. See `package.json` `prepare` script.

### `.husky/commit-msg`

**Purpose**: Validates commit message format to ensure consistency and enable automated tooling.

**Key Actions**:

- Validates Conventional Commits format (`type(scope): subject`)
- Provides helpful error messages with examples
- Works with `.husky/pre-commit` to enforce commit standards

> See [`.husky/commit-msg`](../.husky/commit-msg) for the actual hook file. For commit guidelines and examples, see [Commit Guidelines](../docs/development.md#commit-guidelines).

### `.husky/prepare-commit-msg`

**Purpose**: Manages versioning and changelog updates automatically. This hook makes the project a **self-versioning system**.

**Key Actions**:

- Validates commit message format (must be Conventional Commits compliant)
- Skips processing for merge commits and reverts
- Executes [`scripts/bump-version.ts`](../scripts/bump-version.ts) to calculate the next semantic version based on commit type
- Executes [`scripts/changelog.ts`](../scripts/changelog.ts) to update `CHANGELOG.md` with new entries
- Stages updated `package.json` and `CHANGELOG.md` files
- Only processes commits that follow Conventional Commits format (skips invalid formats)

**Supporting Scripts**:

- [`scripts/bump-version.ts`](../scripts/bump-version.ts) - Semantic version bumping logic
- [`scripts/changelog.ts`](../scripts/changelog.ts) - Changelog generation based on Conventional Commits
- [`scripts/lint.ts`](../scripts/lint.ts) - Unified linting: TypeScript → ESLint → ShellCheck with progress display

> See [`.husky/prepare-commit-msg`](../.husky/prepare-commit-msg) for the actual hook file. For version bumping details, see [Automatic Version Bumping](../docs/development.md#automatic-version-bumping). No manual version management required - just follow Conventional Commits format.

### `.husky/pre-push`

**Purpose**: Final type safety gate before code reaches the remote repository.

**Key Actions**:

- Runs `bun run lint:typescript` before push
- Catches type errors early
- Prevents pushing code with TypeScript errors

> See [`.husky/pre-push`](../.husky/pre-push) for the actual hook file. Complements pre-commit hooks by catching type errors before remote push.
