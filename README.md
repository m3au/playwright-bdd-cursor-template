# Ultimative Playwright E2E stack <!-- omit from toc -->

[![CI](https://github.com/m3au/tech-challenge/actions/workflows/ci.yml/badge.svg)](https://github.com/m3au/tech-challenge/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen)](tests/unit/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.56-green)](https://playwright.dev/)
[![playwright-bdd](https://img.shields.io/badge/playwright--bdd-8.4-orange)](https://github.com/vitalets/playwright-bdd)
[![Bun](https://img.shields.io/badge/Bun-1.2-black)](https://bun.sh/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![ESLint](https://img.shields.io/badge/ESLint-9.38-purple)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-code--formatter-pink)](https://prettier.io/)
[![Axe Core](https://img.shields.io/badge/Axe%20Core-4.11-blue)](https://github.com/dequelabs/axe-core)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-13.0-blue)](https://developer.chrome.com/docs/lighthouse/)
[![Husky](https://img.shields.io/badge/Husky-9.1-green)](https://typicode.github.io/husky/)
[![Markdownlint](https://img.shields.io/badge/Markdownlint-0.18-orange)](https://github.com/DavidAnson/markdownlint)
[![CSpell](https://img.shields.io/badge/CSpell-9.2-purple)](https://cspell.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-enabled-blue)](https://github.com/features/actions)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-enabled-brightgreen)](https://pages.github.com/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

Playwright E2E test automation with BDD.

![Cyberpunk](docs/cyberpunk.gif)

## Table of Contents <!-- omit from toc -->

- [About](#about)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Architecture \& Patterns](#architecture--patterns)
- [AI Assistance](#ai-assistance)
- [Code Quality](#code-quality)
- [Documentation](#documentation)

---

## Online reports! <!-- omit from toc -->

Check 👉🏼 [GitHub Pages HTML Report](https://m3au.github.io/tech-challenge/) for the _**Interactive HTML reports**_ generated automatically from Playwright test runs, including test results, traces, screenshots, and accessibility/performance audit reports.

View workflow runs 👉🏼 [GitHub Actions](https://github.com/m3au/tech-challenge/actions), we're running 30 tests using 2 shards (WORKERS=100% per shard).

---

## About

This project implements a complete Playwright E2E test automation framework with:

- **BDD Testing**: Gherkin feature files with playwright-bdd
- **Page Object Model**: TypeScript 5 decorators directly on POM methods
- **TypeScript**: Full type safety with strict mode
- **Runtime**: Bun package manager and runtime
- **Unit Testing**: 100% coverage for utility functions with Bun test runner
- **Accessibility Testing**: Axe integration for a11y audits
- **Performance Testing**: Lighthouse integration for performance audits
- **Test Reporting**: Interactive HTML reports with GitHub Pages dashboard
- **Code Quality**: ESLint, Prettier, CSpell, Husky hooks, Conventional Commits
- **Environment Configuration**: Multi-environment support with .env files
- **CI/CD**: GitHub Actions with automated test execution and report publishing
- **Dependabot**: Automated dependency updates with version pinning
- **Local Testing**: Act integration for testing GitHub Actions workflows locally
- **AI Assistance**: Cursor IDE integration with rules and MCP servers

For more details, see [Architecture Documentation](./docs/architecture.md) and [Goal](./docs/goal.md).

---

## Project Structure

```text
tech-challenge/
├── .cursor/                 # Cursor IDE configuration
│   ├── mcp.json             # MCP servers (Playwright, GitHub)
│   ├── hooks/               # Example hook scripts (copy to ~/.cursor/hooks/ to use)
│   └── rules/               # Cursor rules (commits, comments, testing, etc.)
├── .github/                 # GitHub configuration
│   ├── workflows/           # CI/CD workflows (GitHub Actions)
│   │   ├── ci.yml           # Main CI orchestrator workflow
│   │   ├── test.yml         # E2E tests workflow
│   │   ├── lighthouse.yml   # Lighthouse audit workflow
│   │   ├── axe.yml          # Axe audit workflow
│   │   └── publish.yml       # Report publishing workflow
│   ├── dependabot.yml       # Dependabot dependency updates
│   └── templates/           # Report templates (HTML)
├── .husky/                  # Git hooks (pre-commit, commit-msg, prepare-commit-msg, pre-push)
├── tests/                   # All test suites
│   ├── e2e/                 # End-to-end tests
│   │   ├── data/            # Data layer (environment configs)
│   │   ├── features/        # Gherkin feature files
│   │   ├── poms/            # Page Object Models with decorators
│   │   │   ├── components/  # Reusable component POMs
│   │   │   └── pages/       # Page POMs
│   │   ├── utils/           # Utility functions
│   │   └── world.ts         # Playwright fixtures and test setup
│   ├── unit/                # Unit tests (100% coverage)
│   │   ├── format.test.ts   # Format utility tests
│   │   ├── random.test.ts   # Random utility tests
│   │   └── locators.test.ts # Locator utility tests
│   └── audit/               # Audit tests (axe, lighthouse)
├── scripts/                 # Utility scripts
│   ├── bump-version.mjs     # Automatic version bumping
│   ├── pin-versions.mjs     # Dependency version pinning
│   └── changelog.mjs        # Changelog generation
├── docs/                    # Documentation
├── Makefile                 # Make targets for local workflow testing
├── package.json             # Dependencies and scripts
├── bun.lock                 # Bun lock file (pinned dependency versions)
├── bunfig.toml              # Bun package manager configuration
├── playwright.config.ts     # Playwright E2E configuration
├── eslint.config.js         # ESLint configuration
├── prettier.config.js       # Prettier configuration
├── tsconfig.json            # TypeScript configuration
├── main.code-workspace      # VS Code workspace configuration
├── .cspell.jsonc            # Spell checker configuration
├── .markdownlint.jsonc      # Markdown linting configuration
├── .lintstagedrc.json       # lint-staged configuration
├── .prettierignore          # Prettier ignore patterns
├── .editorconfig            # Editor configuration (indentation, encoding)
├── .gitignore               # Git ignore patterns
├── .gitattributes           # Git attributes (line endings, file types)
├── .cursorignore            # Cursor IDE ignore patterns
├── .nvmrc                   # Node version manager version
├── .npmrc                   # npm configuration
├── .env.example             # Environment variables template
├── .env.production          # Production environment variables template
├── .env                     # Environment variables (local, gitignored)
├── LICENSE                  # License file
└── README.md                # This file
```

For detailed project structure and architecture, see [Architecture Documentation](./docs/architecture.md).

---

## Setup

**Quick Install:**

```bash
bun install
cp .env.example .env
```

**Configuration:**

- Environment variables via `.env` file (see `.env.example`)
- Production template: `.env.production` (used in CI/CD)
- Supports development, staging, production environments
- Timeouts and URLs configurable per environment
- All environment variables required (no hardcoded defaults)
- Configure `BASE_URL` in `.env` file manually. CI/CD uses GitHub Secrets for `BASE_URL`

**Testing:**

```bash
bun run test     # Run Playwright E2E tests (automatically runs pretest first)
bun test tests/unit/  # Run unit tests (coverage enabled by default via bunfig.toml)
bun pretest      # Generate test files from BDD features
bun ui           # Run tests with Playwright UI
bun headed       # Run tests in headed mode (see browser)
bun debug        # Run tests in debug mode
bun failed       # Run only failed tests from previous run
bun axe          # Run accessibility tests
bun lighthouse   # Run Lighthouse performance tests
```

**Note**: `bun test tests/unit/` runs unit tests using Bun's built-in test runner with coverage enabled by default (configured in `bunfig.toml`). `bun run test` executes the npm script defined in `package.json` which runs Playwright E2E tests.

**Code Quality:**

```bash
bun lint     # Run ESLint, TypeScript type checking, and Markdown linting
bun lint:fix # Fix ESLint and Markdown errors automatically
```

For detailed code quality configuration and all available scripts, see [Code Quality Files](./docs/code-quality.md).

**Dependencies:**

- `bun bump` - Update dependencies to latest versions and pin them
- `bun pin` - Pin all dependency versions to exact versions

**Local Workflow Testing:**

```bash
act -l              # List all available GitHub Actions workflows
make test           # Test E2E tests workflow locally
make lighthouse     # Test Lighthouse audit workflow locally
make axe            # Test Axe audit workflow locally
make publish        # Test publish reports workflow locally
make ci             # Test main CI workflow locally
make test-dryrun    # Dry run E2E tests workflow (list what would run)
```

For detailed setup instructions, configuration, and development workflow, see [Development Guide](./docs/development.md). For local workflow testing setup, see [Act Testing Documentation](./docs/act-testing.md).

## Architecture & Patterns

**Page Object Model:**

POMs are located in `tests/e2e/poms/` with no separate step definition files. Step definitions use decorators directly on POM methods (`@Given`, `@When`, `@Then`), and POMs are registered as fixtures in `tests/e2e/world.ts` using the `@Fixture` decorator.

**World:**

The world fixture (`tests/e2e/world.ts`) extends playwright-bdd test with POM fixtures (CableConfiguratorPage, CableSelectorPopup, CookieBanner, ProductDetailPage), provides a world fixture containing the Playwright page and environment data, exports BDD decorators (`@Fixture`, `@Given`, `@When`, `@Then`) and Playwright types (`expect`, `Locator`, `Page`), and includes a custom `@Step` decorator for internal step definitions.

**Data Layer:**

- Data layer (`tests/e2e/data/config.ts`) loads environment-specific data for test execution

**BDD with Gherkin:**

- Feature files in `tests/e2e/features/`
- Test files generated to `test-output/bdd-gen/`

For more information about architecture and patterns, see [Architecture Documentation](./docs/architecture.md).

## AI Assistance

This project is configured for AI-assisted development with Cursor IDE. Rules guide AI assistants to follow project conventions and maintain code quality.

**Quick Start**:

- Rules automatically apply when editing files (context-aware based on file patterns)
- Use `@browser` for browser automation, `@playwright` for Playwright test features
- Configuration files: `.cursor/rules/` (rules), `.cursor/mcp.json` (MCP servers), `.cursorignore` (context exclusion)

For detailed information on AI configuration, rules, and MCP integrations, see [AI Tuning Documentation](./docs/ai-tuning.md).

---

## Code Quality

This project uses comprehensive code quality tooling:

- **ESLint** (`eslint.config.js`) - Linting with TypeScript, SonarJS, Unicorn, CSpell, Playwright
- **Prettier** (`prettier.config.js`) - Code formatting
- **TypeScript** (`tsconfig.json`) - Type checking with strict mode
- **CSpell** (`.cspell.jsonc`) - Spell checking (English, German, TypeScript)
- **Markdownlint** (`.markdownlint.jsonc`) - Markdown linting
- **EditorConfig** (`.editorconfig`) - Editor configuration for consistent formatting
- **Git Attributes** (`.gitattributes`) - Consistent line endings and file handling
- **Prettier Ignore** (`.prettierignore`) - Prettier ignore patterns
- **Husky** (`.husky/`) - Git hooks (pre-commit, commit-msg, pre-push, prepare-commit-msg)
- **lint-staged** (`.lintstagedrc.json`) - Staged file linting
- **Conventional Commits** - Commit message format validation

**Automated Checks:**

- Pre-commit: ESLint, Prettier, CSpell
- Commit-msg: Conventional commit format validation
- Prepare-commit-msg: Automatic version bumping and changelog generation
- Pre-push: TypeScript type checking
- CI/CD: All checks run automatically

See [Code Quality Files](./docs/code-quality.md) for detailed configuration reference.

**Automatic Versioning:**

Version bumping and changelog generation happen automatically on commit:

- `feat:` commits → Minor version bump + changelog entry
- `fix:` commits → Patch version bump + changelog entry
- `BREAKING CHANGE` → Major version bump + changelog entry

---

## Documentation

- **[Architecture Documentation](./docs/architecture.md)** - System architecture, design decisions, and diagrams
- **[Development Guide](./docs/development.md)** - Development setup, guidelines, and best practices
- **[Code Quality Files](./docs/code-quality.md)** - Reference guide for all code quality configuration files
- **[AI Tuning](./docs/ai-tuning.md)** - Cursor IDE rules and AI assistant configuration
- **[Act Testing](./docs/act-testing.md)** - Local GitHub Actions workflow testing with act
- **[Goal](./docs/goal.md)** - Goal requirements and solution overview

---

Created with ❤️ by mū ([m3au](https://github.com/m3au))

<img src="https://avatars.githubusercontent.com/u/2736565?v=4" width="32" height="32" alt="m3au" />
