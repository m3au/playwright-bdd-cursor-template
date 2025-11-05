# 🚀 Playwright E2E Stack with TypeScript, BDD, and AI-Assistance

[![CI](https://github.com/m3au/tech-challenge/actions/workflows/ci.yml/badge.svg)](https://github.com/m3au/tech-challenge/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen)](tests/unit/)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-enabled-brightgreen)](https://github.com/features/actions)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D24.0.0-brightgreen)](https://nodejs.org/)
[![Bun](https://img.shields.io/badge/Bun-1.3.1-black)](https://bun.sh/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.56.1-green)](https://playwright.dev/)
[![playwright-bdd](https://img.shields.io/badge/playwright--bdd-8.4.1-orange)](https://github.com/vitalets/playwright-bdd)
[![Gherkin](https://img.shields.io/badge/Gherkin-BDD-green)](https://cucumber.io/docs/gherkin/)
[![Axe Core](https://img.shields.io/badge/Axe%20Core-4.11.0-blue)](https://github.com/dequelabs/axe-core)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-13.0.1-blue)](https://developer.chrome.com/docs/lighthouse/)
[![ESLint](https://img.shields.io/badge/ESLint-9.39.0-purple)](https://eslint.org/)
[![TypeScript ESLint](https://img.shields.io/badge/TypeScript%20ESLint-8.46.2-blue)](https://typescript-eslint.io/)
[![SonarJS](https://img.shields.io/badge/SonarJS-3.0.5-orange)](https://github.com/SonarSource/eslint-plugin-sonarjs)
[![Unicorn](https://img.shields.io/badge/Unicorn-62.0.0-purple)](https://github.com/sindresorhus/eslint-plugin-unicorn)
[![Prettier](https://img.shields.io/badge/Prettier-code--formatter-pink)](https://prettier.io/)
[![CSpell](https://img.shields.io/badge/CSpell-9.2.2-purple)](https://cspell.org/)
[![Markdownlint](https://img.shields.io/badge/Markdownlint-0.18.1-orange)](https://github.com/DavidAnson/markdownlint)
[![Husky](https://img.shields.io/badge/Husky-9.1.7-green)](https://typicode.github.io/husky/)
[![lint-staged](https://img.shields.io/badge/lint--staged-16.2.6-yellow)](https://github.com/lint-staged/lint-staged)
[![EditorConfig](https://img.shields.io/badge/EditorConfig-enabled-blue)](https://editorconfig.org/)
[![ES Modules](https://img.shields.io/badge/ES%20Modules-enabled-brightgreen)](https://nodejs.org/api/esm.html)
[![Dependabot](https://img.shields.io/badge/Dependabot-enabled-blue)](https://github.com/dependabot)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-enabled-brightgreen)](https://pages.github.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

Playwright E2E test automation with BDD.

![Cyberpunk animation showing futuristic cityscape](docs/cyberpunk.gif)

## Table of Contents <!-- omit from toc -->

- [About](#about)
- [Test Reports](#test-reports)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Quick Setup](#quick-setup)
- [Architecture \& Patterns](#architecture--patterns)
  - [Page Object Model](#page-object-model)
  - [World](#world)
  - [Data Layer](#data-layer)
  - [BDD with Gherkin](#bdd-with-gherkin)
- [AI Assistance](#ai-assistance)
- [Code Quality](#code-quality)

---

## About

This project implements a complete Playwright E2E test automation framework with:

- **Behavior-Driven Development (BDD)**: Utilizes Gherkin and `playwright-bdd` for clear, collaborative feature development
- **Decorated Page Object Model (POM)**: Eliminates separate step files by using **TypeScript decorators** (`@Given`, `@When`, `@Then`) directly on POM methods
- **TypeScript**: Full type safety with strict mode enabled
- **High-Speed Runtime**: Leverages **Bun** as both package manager and runtime for blazing-fast execution
- **100% Code Coverage**: Guaranteed for all utility functions via **Bun's built-in test runner**
- **Accessibility Testing**: Axe-core integration for automated WCAG compliance audits
- **Performance Testing**: Lighthouse integration for Core Web Vitals and performance audits
- **Interactive HTML Reports**: Automatically published to a dedicated **GitHub Pages dashboard** (including traces and media)
- **Code Quality**: ESLint, Prettier, CSpell, Husky hooks, and Conventional Commits enforcement
- **Environment Configuration**: Multi-environment support (development, staging, production) via .env files
- **CI/CD**: GitHub Actions workflows with automated test execution and report publishing
- **Dependabot**: Automated dependency updates with strict version pinning
- **Local Testing**: Act integration for testing GitHub Actions workflows locally before pushing
- **AI-Assisted Development**: Optimized for **Cursor IDE** with custom rules to enforce project conventions

---

## Test Reports

![Test Reports Dashboard](docs/reports.jpg)

Check 👉🏼 [GitHub Pages HTML Report](https://m3au.github.io/tech-challenge/) for the _**Interactive HTML reports**_ generated automatically from Playwright test runs, including test results, traces, screenshots, and accessibility/performance audit reports.

View workflow runs 👉🏼 [GitHub Actions](https://github.com/m3au/tech-challenge/actions), we're running 30 tests using 2 shards (WORKERS=100% per shard).

---

## Documentation

Comprehensive documentation covering architecture, development workflows, code quality tools, AI assistance configuration, and project goals. All documentation is located in the `docs/` directory.

- **[Architecture Documentation](./docs/architecture.md)** - System architecture, design decisions, and diagrams
- **[Development Guide](./docs/development.md)** - Development setup, guidelines, and best practices
- **[Code Quality Files](./docs/code-quality.md)** - Reference guide for all code quality configuration files
- **[AI Tuning](./docs/ai-tuning.md)** - Cursor IDE rules and AI assistant configuration
- **[Act Testing](./docs/act-testing.md)** - Local GitHub Actions workflow testing with act
- **[Changelog](./CHANGELOG.md)** - Complete version history and release notes

---

## Project Structure

A high-level view of the project's directory structure:

```text
tech-challenge/
├── .cursor/                   # Cursor IDE configuration
│   ├── mcp.json               # MCP servers (Playwright, GitHub)
│   ├── hooks/                 # Example hook scripts (copy to ~/.cursor/hooks/ to use)
│   └── rules/                 # Cursor rules (commits, comments, testing, etc.)
├── **.github/**               # GitHub configuration
│   ├── **workflows/**         # CI/CD workflows (GitHub Actions)
│   │   ├── ci.yml             # Main CI orchestrator workflow + report publishing
│   │   ├── unit-tests.yml     # Unit tests workflow
│   │   ├── test.yml           # E2E tests workflow
│   │   ├── lighthouse.yml     # Lighthouse audit workflow
│   │   └── axe.yml            # Axe audit workflow
│   ├── dependabot.yml         # Dependabot dependency updates
│   └── templates/             # Report templates (HTML)
├── .husky/                    # Git hooks (pre-commit, commit-msg, prepare-commit-msg, pre-push)
├── **tests/**                 # All test suites
│   ├── **e2e/**               # End-to-end tests
│   │   ├── data/              # Data layer (environment configs)
│   │   ├── **features/**      # Gherkin feature files
│   │   ├── **poms/**          # Page Object Models with decorators
│   │   │   ├── components/    # Reusable component POMs
│   │   │   └── pages/         # Page POMs
│   │   └── **world.ts**       # Playwright fixtures and test setup
│   ├── utils/                 # Shared utility functions
│   ├── unit/                  # Unit tests (100% coverage)
│   │   ├── format.test.ts     # Format utility tests
│   │   ├── random.test.ts     # Random utility tests
│   │   └── locators.test.ts   # Locator utility tests
│   └── audit/                 # Audit tests (axe, lighthouse)
├── **scripts/**               # Utility scripts
│   ├── bump-version.mjs       # Automatic version bumping
│   ├── pin-versions.mjs       # Dependency version pinning
│   ├── changelog.mjs          # Changelog generation
│   └── lint.mjs               # Unified linting: TypeScript → ESLint → ShellCheck
├── docs/                      # Documentation
├── Makefile                   # Make targets for local workflow testing
├── package.json               # Dependencies and scripts
├── bun.lock                   # Bun lock file (pinned dependency versions)
├── bunfig.toml                # Bun package manager configuration
├── playwright.config.ts       # Playwright E2E configuration
├── eslint.config.mjs          # ESLint configuration
├── prettier.config.mjs        # Prettier configuration
├── tsconfig.json              # TypeScript configuration
├── main.code-workspace        # VS Code workspace configuration
├── .cspell.jsonc              # Spell checker configuration
├── .markdownlint.jsonc        # Markdown linting configuration
├── .lintstagedrc.json         # lint-staged configuration
├── .prettierignore            # Prettier ignore patterns
├── .editorconfig              # Editor configuration (indentation, encoding)
├── .gitignore                 # Git ignore patterns
├── .gitattributes             # Git attributes (line endings, file types)
├── .cursorignore              # Cursor IDE ignore patterns
├── .nvmrc                     # Node version manager version
├── .npmrc                     # npm configuration
├── .env.example               # Environment variables template
├── .env.production            # Production environment variables template
├── .env                       # Environment variables (local, gitignored)
├── LICENSE                    # License file
└── README.md                  # This file
```

---

## Quick Setup

**Install:**

```bash
bun install
```

**Configure:**

Copy [`.env.example`](.env.example) to `.env` and customize the configuration:

```bash
cp .env.example .env
```

Environment-specific templates ([`.env.production`](.env.production)) are also available for different deployment environments.

See [Development Guide](./docs/development.md#environment-configuration) for complete environment variable documentation and CI vs local configuration differences.

**Run:**

```bash
bun run          # List all available project commands
bun run test     # Run E2E tests (includes pretest step)
bun test         # Run unit tests with coverage enabled
bun pretest      # Generate BDD step files from Gherkin features
bun ui           # Run tests with Playwright UI
bun headed       # Run E2E tests in visible browser mode
bun debug        # Run E2E tests with Playwright's interactive debugger
bun failed       # Run only failed tests from previous run
bun axe          # Run accessibility tests
bun lighthouse   # Run Lighthouse performance tests
```

**Code Quality:**

```bash
bun lint              # Run all linting: TypeScript → ESLint → ShellCheck (with progress)
bun lint:fix          # Fix ESLint errors automatically (TS, MJS, JSON, HTML, Markdown, YAML)
bun lint:typescript   # TypeScript type checking only
bun lint:eslint       # ESLint only (TS, MJS, JSON, HTML, Markdown, YAML, .mdc)
bun lint:markdown     # Markdown linting only
bun lint:shellcheck   # ShellCheck only (Husky git hooks)
```

**Local CI/CD Testing:**

Test GitHub Actions workflows locally using the Makefile (requires Docker and act):

```bash
make test        # Test E2E tests workflow locally
make lighthouse  # Test Lighthouse audit workflow locally
make axe         # Test Axe audit workflow locally
make ci          # Test main CI workflow locally
make publish     # Test publish reports workflow locally
make help        # Show all available workflow test targets
```

## Architecture & Patterns

### Page Object Model

**Page Object Model (POM):** Located in `tests/e2e/poms/`. This framework eliminates separate step definition files by applying **BDD decorators** (`@Given`, `@When`, `@Then`) directly to the Page Object methods. POMs are automatically registered as fixtures using the `@Fixture` decorator.

### World

**Custom Fixture (`tests/e2e/world.ts`):** This file is the central hub. It extends the standard `playwright-bdd` test, registers all POMs (CableConfiguratorPage, CableSelectorPopup, CookieBanner, ProductDetailPage) using the custom `@Fixture` decorator, provides a world fixture containing the Playwright page and environment data, and exports the core BDD decorators (`@Fixture`, `@Given`, `@When`, `@Then`) and Playwright types (`expect`, `Locator`, `Page`). The custom `@Step` decorator for internal step definitions is defined in `tests/utils/decorators.ts` and re-exported from `@world`.

### Data Layer

**Data Layer (`tests/e2e/data/config.ts`):** Loads environment-specific data for test execution.

### BDD with Gherkin

**BDD with Gherkin:** Feature files are located in `tests/e2e/features/`. Test files are automatically generated to `test-output/bdd-gen/`.

## AI Assistance

This project is configured for AI-assisted development with Cursor IDE. Rules guide AI assistants to follow project conventions and maintain code quality.

**Configuration:**

- Rules automatically apply when editing files (context-aware based on file patterns)
- Use `@browser` for browser automation, `@playwright` for Playwright test features
- Configuration files: `.cursor/rules/` (rules), `.cursor/mcp.json` (MCP servers), `.cursorignore` (context exclusion)

---

## Code Quality

This project uses comprehensive code quality tooling:

- **ESLint** (`eslint.config.mjs`) - Linting with TypeScript, SonarJS, Unicorn, CSpell, Playwright, JSON, HTML, YAML, and Markdown support
- **ShellCheck** - Shell script linting for Husky git hooks
- **Prettier** (`prettier.config.mjs`) - Code formatting
- **TypeScript** (`tsconfig.json`) - Type checking with strict mode
- **CSpell** (`.cspell.jsonc`) - Spell checking (English, German, TypeScript)
- **EditorConfig** (`.editorconfig`) - Editor configuration for consistent formatting
- **Git Attributes** (`.gitattributes`) - Consistent line endings and file handling
- **Husky** (`.husky/`) - Git hooks (pre-commit, commit-msg, pre-push, prepare-commit-msg)
- **lint-staged** (`.lintstagedrc.json`) - Staged file linting
- **Conventional Commits** - Commit message format validation

**Git Hook Actions:**

- **Pre-commit**: Runs **Unit Tests**, then executes **lint-staged** (ESLint, Prettier, ShellCheck) on only the staged files for speed
- **Commit-msg**: Validates conventional commit format
- **Prepare-commit-msg**: Automatically calculates the next **Semantic Version** and updates the `CHANGELOG.md` based on your commit message
- **Pre-push**: TypeScript type checking
- **CI/CD**: Runs all quality gates automatically (unit tests run first, before other tests)

**Editor Integration:**

- **Format on Save**: Enabled via VS Code workspace settings (Prettier for all files)
- **ESLint**: Auto-fix on save enabled (TS, JS, Markdown via @eslint/markdown)
- **TypeScript**: Real-time type checking
- **CSpell**: Spell checking integrated into ESLint
- **EditorConfig**: Consistent formatting across editors

**Automatic Versioning:**

Version bumping and changelog generation happen automatically on commit:

- `feat:` commits → Minor version bump + changelog entry
- `fix:` commits → Patch version bump + changelog entry
- `perf:` commits → Patch version bump + changelog entry (performance improvements)
- `refactor:` commits → Patch version bump + changelog entry (code refactoring)
- `BREAKING CHANGE` → Major version bump + changelog entry
- Other commit types (`docs:`, `style:`, `test:`, `chore:`, `ci:`, `build:`) → No version bump

See [CHANGELOG.md](./CHANGELOG.md) for complete version history.

---

Created with ❤️ by mū ([m3au](https://github.com/m3au))

<img src="https://avatars.githubusercontent.com/u/2736565?v=4" width="48" height="48" alt="m3au" />
