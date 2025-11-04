# Ultimate Playwright E2E stack <!-- omit from toc -->

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

![Cyberpunk animation showing futuristic cityscape](docs/cyberpunk.gif)

## Table of Contents <!-- omit from toc -->

- [About](#about)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Quick Setup](#quick-setup)
- [Architecture \& Patterns](#architecture--patterns)
- [AI Assistance](#ai-assistance)
- [Code Quality](#code-quality)

---

## Online reports! <!-- omit from toc -->

![Test Reports Dashboard](docs/reports.jpg)

Check 👉🏼 [GitHub Pages HTML Report](https://m3au.github.io/tech-challenge/) for the _**Interactive HTML reports**_ generated automatically from Playwright test runs, including test results, traces, screenshots, and accessibility/performance audit reports.

View workflow runs 👉🏼 [GitHub Actions](https://github.com/m3au/tech-challenge/actions), we're running 30 tests using 2 shards (WORKERS=100% per shard).

---

## About

This project implements a complete Playwright E2E test automation framework with:

- **BDD Testing**: Gherkin feature files with playwright-bdd for behavior-driven development
- **Page Object Model**: TypeScript 5 decorators applied directly on POM methods (no separate step definitions)
- **TypeScript**: Full type safety with strict mode enabled
- **Runtime**: Bun package manager and runtime for fast execution
- **Unit Testing**: 100% code coverage for utility functions using Bun's built-in test runner
- **Accessibility Testing**: Axe-core integration for automated WCAG compliance audits
- **Performance Testing**: Lighthouse integration for Core Web Vitals and performance audits
- **Test Reporting**: Interactive HTML reports published to GitHub Pages dashboard
- **Code Quality**: ESLint, Prettier, CSpell, Husky hooks, and Conventional Commits enforcement
- **Environment Configuration**: Multi-environment support (development, staging, production) via .env files
- **CI/CD**: GitHub Actions workflows with automated test execution and report publishing
- **Dependabot**: Automated dependency updates with strict version pinning
- **Local Testing**: Act integration for testing GitHub Actions workflows locally before pushing
- **AI Assistance**: Cursor IDE integration with project rules and MCP server connections

---

## Documentation

Comprehensive documentation covering architecture, development workflows, code quality tools, AI assistance configuration, and project goals. All documentation is located in the `docs/` directory.

- **[Architecture Documentation](./docs/architecture.md)** - System architecture, design decisions, and diagrams
- **[Development Guide](./docs/development.md)** - Development setup, guidelines, and best practices
- **[Code Quality Files](./docs/code-quality.md)** - Reference guide for all code quality configuration files
- **[AI Tuning](./docs/ai-tuning.md)** - Cursor IDE rules and AI assistant configuration
- **[Act Testing](./docs/act-testing.md)** - Local GitHub Actions workflow testing with act
- **[Goal](./docs/goal.md)** - Goal requirements and solution overview
- **[Changelog](./CHANGELOG.md)** - Complete version history and release notes

---

## Project Structure

```text
tech-challenge/
├── .cursor/                   # Cursor IDE configuration
│   ├── mcp.json               # MCP servers (Playwright, GitHub)
│   ├── hooks/                 # Example hook scripts (copy to ~/.cursor/hooks/ to use)
│   └── rules/                 # Cursor rules (commits, comments, testing, etc.)
├── .github/                   # GitHub configuration
│   ├── workflows/             # CI/CD workflows (GitHub Actions)
│   │   ├── ci.yml             # Main CI orchestrator workflow
│   │   ├── unit-tests.yml     # Unit tests workflow
│   │   ├── test.yml           # E2E tests workflow
│   │   ├── lighthouse.yml     # Lighthouse audit workflow
│   │   ├── axe.yml            # Axe audit workflow
│   │   └── publish.yml        # Report publishing workflow
│   ├── dependabot.yml         # Dependabot dependency updates
│   └── templates/             # Report templates (HTML)
├── .husky/                    # Git hooks (pre-commit, commit-msg, prepare-commit-msg, pre-push)
├── tests/                     # All test suites
│   ├── e2e/                   # End-to-end tests
│   │   ├── data/              # Data layer (environment configs)
│   │   ├── features/          # Gherkin feature files
│   │   ├── poms/              # Page Object Models with decorators
│   │   │   ├── components/    # Reusable component POMs
│   │   │   └── pages/         # Page POMs
│   │   ├── utils/             # Utility functions
│   │   └── world.ts           # Playwright fixtures and test setup
│   ├── unit/                  # Unit tests (100% coverage)
│   │   ├── format.test.ts     # Format utility tests
│   │   ├── random.test.ts     # Random utility tests
│   │   └── locators.test.ts   # Locator utility tests
│   └── audit/                 # Audit tests (axe, lighthouse)
├── scripts/                   # Utility scripts
│   ├── bump-version.mjs       # Automatic version bumping
│   ├── pin-versions.mjs       # Dependency version pinning
│   └── changelog.mjs          # Changelog generation
├── docs/                      # Documentation
├── Makefile                   # Make targets for local workflow testing
├── package.json               # Dependencies and scripts
├── bun.lock                   # Bun lock file (pinned dependency versions)
├── bunfig.toml                # Bun package manager configuration
├── playwright.config.ts       # Playwright E2E configuration
├── eslint.config.js           # ESLint configuration
├── prettier.config.js         # Prettier configuration
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

The `.env` file supports the following configuration options:

| Variable           | Description                                                                                                 | Default          |
| :----------------- | :---------------------------------------------------------------------------------------------------------- | :--------------- |
| `BASE_URL`         | Base URL for the application under test                                                                     | -                |
| `TIMEOUT`          | Global timeout for all Playwright actions (milliseconds)                                                    | `30000`          |
| `EXPECT_TIMEOUT`   | Timeout for assertions (milliseconds)                                                                       | `15000`          |
| `WORKERS`          | Number of parallel test workers (number or percentage; percentage is calculated based on machine CPU cores) | `50%`            |
| `RETRIES`          | Number of times to retry failed tests                                                                       | `1`              |
| `REPEAT_EACH`      | Number of times to repeat each test (0 = disabled)                                                          | `0`              |
| `CHROMIUM_ENABLED` | Enable/disable Chromium browser tests                                                                       | `true`           |
| `FIREFOX_ENABLED`  | Enable/disable Firefox browser tests                                                                        | `false`          |
| `WEBKIT_ENABLED`   | Enable/disable WebKit browser tests                                                                         | `false`          |
| `TRACE`            | Trace mode for debugging                                                                                    | `on-first-retry` |

For a complete list of all configuration options, see [Development Guide](./docs/development.md#environment-configuration).

Environment-specific templates ([`.env.production`](.env.production)) are also available for different deployment environments.

**Run:**

```bash
bun run test     # Run Playwright E2E tests (automatically runs pretest first)
bun test         # Run unit tests (coverage enabled by default via bunfig.toml)
bun pretest      # Generate test files from BDD features
bun ui           # Run tests with Playwright UI
bun headed       # Run tests in headed mode (see browser)
bun debug        # Run tests in debug mode
bun failed       # Run only failed tests from previous run
bun axe          # Run accessibility tests
bun lighthouse   # Run Lighthouse performance tests
```

**Code Quality:**

```bash
bun lint     # Run ESLint, TypeScript type checking, and Markdown linting
bun lint:fix # Fix ESLint and Markdown errors automatically
```

For detailed code quality configuration and all available scripts, see [Code Quality Files](./docs/code-quality.md).

**Note**: `bun test` runs unit tests (coverage enabled via `bunfig.toml`). `bun run test` runs Playwright E2E tests.

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

For more information, see [Act Testing Documentation](./docs/act-testing.md).

For detailed setup instructions, configuration, and development workflow, see [Development Guide](./docs/development.md).

## Architecture & Patterns

**Page Object Model:**

POMs are located in `tests/e2e/poms/` with no separate step definition files. Step definitions use decorators directly on POM methods (`@Given`, `@When`, `@Then`), and POMs are registered as fixtures in `tests/e2e/world.ts` using the `@Fixture` decorator.

**World:**

The world fixture (`tests/e2e/world.ts`) extends playwright-bdd test with POM fixtures (CableConfiguratorPage, CableSelectorPopup, CookieBanner, ProductDetailPage), provides a world fixture containing the Playwright page and environment data, and exports BDD decorators (`@Fixture`, `@Given`, `@When`, `@Then`) and Playwright types (`expect`, `Locator`, `Page`). The custom `@Step` decorator for internal step definitions is defined in `tests/e2e/utils/decorators.ts` and re-exported from `@world`.

**Data Layer:**

- Data layer (`tests/e2e/data/config.ts`) loads environment-specific data for test execution

**BDD with Gherkin:**

- Feature files in `tests/e2e/features/`
- Test files generated to `test-output/bdd-gen/`

For more information about architecture and patterns, see [Architecture Documentation](./docs/architecture.md).

## AI Assistance

This project is configured for AI-assisted development with Cursor IDE. Rules guide AI assistants to follow project conventions and maintain code quality.

**Configuration:**

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
- **Husky** (`.husky/`) - Git hooks (pre-commit, commit-msg, pre-push, prepare-commit-msg)
- **lint-staged** (`.lintstagedrc.json`) - Staged file linting
- **Conventional Commits** - Commit message format validation

**Quality Gates:**

- **Pre-commit**: Unit tests, ESLint, Prettier, CSpell
- **Commit-msg**: Conventional commit format validation
- **Prepare-commit-msg**: Automatic version bumping and changelog generation
- **Pre-push**: TypeScript type checking
- **CI/CD**: All checks run automatically (unit tests run first, before other tests)

**Editor Integration:**

- **Format on Save**: Enabled via VS Code workspace settings (Prettier for code, Markdownlint for markdown)
- **ESLint**: Auto-fix on save enabled
- **TypeScript**: Real-time type checking
- **CSpell**: Spell checking integrated into ESLint
- **EditorConfig**: Consistent formatting across editors

See [Code Quality Files](./docs/code-quality.md) for detailed configuration reference.

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
