# Development Guide <!-- omit from toc -->

This guide provides setup instructions and development guidelines for the project.

![Placeholder](https://placecats.com/neo_banana/400/200)

## Table of Contents <!-- omit from toc -->

- [Development Setup](#development-setup)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Development Workflow](#development-workflow)
  - [Running Tests](#running-tests)
  - [Local Workflow Testing](#local-workflow-testing)
  - [Code Quality](#code-quality)
  - [Pre-commit Hooks](#pre-commit-hooks)
- [AI Assistance](#ai-assistance)
- [Writing Tests](#writing-tests)
  - [Adding a New Feature](#adding-a-new-feature)
  - [Adding a New Page Object Model](#adding-a-new-page-object-model)
  - [Best Practices](#best-practices)
  - [Test Data](#test-data)
  - [Debugging Tests](#debugging-tests)
- [Commit Guidelines](#commit-guidelines)
  - [Types](#types)
  - [Examples](#examples)
  - [Automatic Version Bumping](#automatic-version-bumping)
- [Dependencies](#dependencies)
  - [Adding Dependencies](#adding-dependencies)
  - [Updating Dependencies](#updating-dependencies)
- [Troubleshooting](#troubleshooting)
  - [Tests Fail Locally But Pass in CI](#tests-fail-locally-but-pass-in-ci)
- [Configuration Files](#configuration-files)
  - [Test Configuration](#test-configuration)
  - [Environment Configuration](#environment-configuration)

---

## Development Setup

### Prerequisites

- **Node.js**: >= 24.0.0
- **Bun**: >= 1.3.1 (package manager and runtime)
- **Git**: Latest version

### Installation

```shell
# Clone the repository
git clone https://github.com/m3au/playwright-bdd-cursor-template.git
cd playwright-bdd-cursor-template

# Install dependencies
bun install

# Copy environment file
cp .env.example .env
```

### Environment Variables

**Required**: Configure environment variables in `.env`. The `.env` file should be created from `.env.example` during installation (see [Installation](#installation)).

See [Environment Configuration](#environment-configuration) for detailed variable descriptions and CI/CD setup.

## Development Workflow

### Running Tests

| Command                            | Suite | Purpose                                                               |
| :--------------------------------- | :---- | :-------------------------------------------------------------------- |
| `bun run test`                     | E2E   | Generates BDD stubs, then runs all Playwright projects                |
| `bun run test:automationexercise`  | E2E   | Runs only the AutomationExercise challenge (pretest included)         |
| `bun run test:uitestingplayground` | E2E   | Runs only the UITestingPlayground challenge (pretest included)        |
| `bun ui`                           | E2E   | Run tests in UI mode                                                  |
| `bun headed`                       | E2E   | Run tests in headed mode (visible browser)                            |
| `bun debug`                        | E2E   | Run tests in debug mode (with Playwright Inspector)                   |
| `bun failed`                       | E2E   | Run only failed tests                                                 |
| `bun pretest`                      | E2E   | Generate test files from BDD features (pre-step, normally via `test`) |
| `bun test`                         | Unit  | Run Bun unit tests with coverage (configured via `bunfig.toml`)       |

Unit tests use Bun's built-in test runner and achieve 100% code coverage for utility functions (`tests/utils/`) and scripts (`scripts/`). Tests are located in `tests/unit/` and `bunfig.toml` is configured with `root = "tests/unit"` so `bun test` only runs unit tests. Coverage is enabled by default, with `tests/utils/decorators.ts` excluded from coverage due to Bun's tooling limitations with decorators.

Unit tests cover all utility modules (attachments, browser-project, bug-reporter, decorators, environment, format, locators, network, pagination, random) and all scripts (bump-version, changelog, lint, pin-versions).

- Unit tests run automatically before every commit (pre-commit hook)
- Pre-flight checks (lint + unit tests) run first in CI/CD before other tests (E2E, Lighthouse, Axe)

### Local Workflow Testing

Test GitHub Actions workflows locally using [act](https://github.com/nektos/act):

```shell
# List all available workflows (use act directly)
act -l

# Test individual workflows
make test           # Test E2E tests workflow locally
make lighthouse     # Test Lighthouse audit workflow locally
make axe            # Test Axe audit workflow locally
make publish        # Test publish reports workflow locally
make ci             # Test main CI workflow locally
make test-dryrun    # Dry run E2E tests workflow (list what would run)
```

**Prerequisites:**

- Docker installed and running (`docker ps` should work)
- `act` installed (`brew install act`)

**Environment Variables:**

- All environment variables come from `.env.production` (committed to repo) in CI
- For local testing with act, ensure `.env` file contains all required `BASE_URL_<CHALLENGE>` variables and audit targets (`BASE_URL_AXE_*`, `BASE_URL_LIGHTHOUSE_*`)
- Act reads environment variables from `.env` file via the `--secret-file` flag (this is just the flag name, not actual secrets)

For **detailed setup and troubleshooting**, including prerequisites like Docker, see the [Act Testing Documentation](./act-testing.md).

### Code Quality

This project enforces high code quality standards through linting, formatting, type checking, and spell checking.

For detailed configuration and tools, see [Code Quality Files Reference](./code-quality.md).

**Editor Integration:**

VS Code workspace settings (`main.code-workspace`) configure automatic code quality on save:

- **Format on Save**: Prettier automatically formats files
- **Auto-fix on save**: ESLint and markdownlint automatically fix issues
- **Ruler at 100 characters**: Visual guide for line length
- **TypeScript**: Real-time type checking
- **CSpell**: Spell checking integrated into ESLint
- **EditorConfig**: Consistent formatting across editors

**Recommended Extensions:**

- `editorconfig.editorconfig` - EditorConfig support
- `esbenp.prettier-vscode` - Prettier formatter
- `dbaeumer.vscode-eslint` - ESLint integration (includes Markdown linting via @eslint/markdown)
- `ms-playwright.playwright` - Playwright test support
- `streetsidesoftware.code-spell-checker` - CSpell spell checking
- `streetsidesoftware.code-spell-checker-german` - German spell checking
- `alexkrechik.cucumberautocomplete` - Cucumber/Gherkin autocomplete
- `cucumberopen.cucumber-official` - Cucumber official support
- `redhat.vscode-yaml` - YAML support for GitHub workflows
- `usernamehw.errorlens` - Inline error display
- `yoavbls.pretty-ts-errors` - Enhanced TypeScript error display
- `amatiasq.sort-imports` - Automatic import sorting

These settings ensure code quality is maintained automatically as you type and save files.

**Scripts:**

```shell
# Run all linters (TypeScript → ESLint → ShellCheck with progress)
bun lint

# Fix linting errors automatically (ESLint including JSON, HTML, Markdown, YAML)
bun lint:fix

# Run individual linters
bun lint:typescript   # TypeScript type checking only
bun lint:eslint       # ESLint only (TS, MJS, JSON, HTML, Markdown, YAML, .mdc)
bun lint:markdown     # Markdown linting only
bun lint:shellcheck   # ShellCheck only (Husky git hooks)
```

### Pre-commit Hooks

Husky Git hooks enforce code quality and commit message standards. They run unit tests and `lint-staged` (ESLint, Prettier, ShellCheck on staged files) on `pre-commit` and TypeScript type checking on `pre-push`.

For detailed configuration, see [Code Quality Files Reference](./code-quality.md#pre-commit-hooks).

**Bypassing hooks temporarily:**

```shell
git commit --no-verify
```

## AI Assistance

This project is configured for AI-assisted development with Cursor IDE. Rules guide AI assistants to follow project conventions and maintain code quality.

**Quick Start**: Rules automatically apply when editing files (context-aware based on file patterns). Use `@browser` for browser automation, `@playwright` for Playwright test features.

For detailed configuration, rules, and MCP integrations, see [AI Tuning Documentation](./ai-tuning.md).

## Writing Tests

### Adding a New Feature

1. Create a `.feature` file in `tests/e2e/challenges/<challenge-name>/features/`
2. Write Gherkin scenarios
3. Implement step definitions in POMs using decorators

### Adding a New Page Object Model

1. Create a new file in `tests/e2e/challenges/<challenge-name>/poms/pages/` or `tests/e2e/challenges/<challenge-name>/poms/components/`
2. Use `@Fixture` decorator to register the POM (use PascalCase for fixture name matching class name)
3. Use `@Given`, `@When`, `@Then` decorators for step definitions
4. Use `@Step` decorator for internal helper methods (imported from `@world`, defined in `tests/utils/decorators.ts`)
5. Register the POM fixture in `tests/e2e/world.ts`

For a complete implementation example, refer to `tests/e2e/challenges/uitestingplayground/poms/pages/home-page.ts` or `tests/e2e/challenges/uitestingplayground/poms/pages/ajax-data-page.ts`.

### Best Practices

1. **Use Page Object Model Pattern**: All page interactions go through POMs
2. **Use Decorators**: Step definitions are decorators on POM methods
3. **PascalCase Fixtures**: Fixture names should match class names (e.g., `@Fixture('HomePage')`, `@Fixture('AjaxDataPage')`)
4. **Wait Strategically**: Use Playwright's built-in waiting mechanisms
5. **Follow BDD Conventions**: Given/When/Then structure
6. **Step Naming**: Always start steps with **"I"** (e.g., "I navigate", "I click", "I see")
7. **Avoid "should"**: Use **"I see"** instead of "I should see"
8. **One Action Per Step**: Never use **"and"/"or"** in the middle of a step description

### Test Data

- Use environment variables for configuration (accessed via `getEnvironment()` from `@world`)
- Environment configuration is centralized in `tests/utils/environment.ts`
- Avoid hardcoded values - use `.env` files for all configuration

### Debugging Tests

```shell
# Run with Playwright Inspector
bun debug

# Run in headed mode
bun headed

# Run with UI mode
bun ui
```

**Note**: For code quality tool configuration reference, see [Code Quality Files](./code-quality.md).

## Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Maintenance tasks

### Examples

```shell
feat(playwright): add manufacturer selection step
fix(tests): resolve timeout in basket validation
docs: update contributing guide
```

### Automatic Version Bumping

Version bumping and changelog generation happen automatically on commit:

| Commit Type/Keyword                         | Version Bump                |
| :------------------------------------------ | :-------------------------- |
| `feat:`                                     | Minor (e.g., 0.1.0 → 0.2.0) |
| `fix:`, `perf:`, `refactor:`                | Patch (e.g., 0.1.0 → 0.1.1) |
| `BREAKING CHANGE` or `feat!:`               | Major (e.g., 0.1.0 → 1.0.0) |
| `docs:`, `style:`, `test:`, `chore:` (etc.) | No version bump             |

The `prepare-commit-msg` hook automatically:

1. Bumps `package.json` version based on commit type
2. Updates [`CHANGELOG.md`](../CHANGELOG.md) with the new entry
3. Stages both files for commit

No manual version management needed - just follow Conventional Commits format and versions are handled automatically.

## Dependencies

### Adding Dependencies

Add dependencies using standard Bun commands (`bun add <package-name>` or `bun add -d <package-name>` for dev dependencies).

**Important**: Always run `bun pin` after adding any dependency to pin versions to exact versions (no `^` or `~`).

```shell
bun pin
```

### Updating Dependencies

```shell
# Update all dependencies
bun bump

# This runs: ncu -u && bun install && bun pin
```

## Troubleshooting

### Tests Fail Locally But Pass in CI

- Check environment variables match CI values
- Verify timeout values are appropriate
- Ensure network connectivity
- Review browser version differences

## Configuration Files

### Test Configuration

- **`playwright.config.ts`**: Unified Playwright configuration with multiple projects:

  - Browser projects: `chromium`, `firefox`, `webkit` (configurable via environment variables)
  - `lighthouse`: Performance testing with Lighthouse
  - `axe`: Accessibility testing with Axe

  The config uses `defineBddConfig` to generate BDD tests and follows a pattern of defining default local configuration, then overriding CI-specific settings (like `forbidOnly` and reporters) when running in CI/CD environments.

The config includes error handling that throws if `.env` file is missing.

### Environment Configuration

**Files:**

- **`.env`**: Local environment file (gitignored, must be created manually)
- **`.env.example`**: Template for local development (copy to `.env`)
- **`.env.production`**: Production defaults for CI/CD (committed to repo, used in GitHub Actions workflows)

**Important**: All values must be provided via `.env` files (no hardcoded defaults in code). All Playwright configs throw errors if `.env` is missing or if required environment variables are not set.

**Environment Variables:**

The `.env` file supports comprehensive Playwright configuration options. See `.env.example` for the complete list with descriptions. Key categories include:

**Test Execution:**

- **`BASE_URL_AXE_W3C_BAD`**, **`BASE_URL_AXE_W3C_AFTER`**, **`BASE_URL_AXE_DEQUE_MARS`** – Accessibility audit targets (used by Axe smoke tests)
- **`BASE_URL_LIGHTHOUSE_POLYMER`**, **`BASE_URL_LIGHTHOUSE_W3C_BAD`** – Performance audit targets (used by Lighthouse smoke tests)
- **`BASE_URL_<CHALLENGE>`** – Challenge-specific base URLs (required for each challenge)
  - **`BASE_URL_UITESTINGPLAYGROUND`** – Base URL for UITestingPlayground challenge
  - **`BASE_URL_AUTOMATIONEXERCISE`** – Base URL for AutomationExercise challenge
  - Each challenge must have its own `BASE_URL_<CHALLENGE>` variable (no fallback)
- **`TIMEOUT`** – Global timeout for all Playwright actions in milliseconds (required)
- **`EXPECT_TIMEOUT`** – Timeout for assertions in milliseconds (required)
- **`WORKERS`** - Number of parallel test workers (number or percentage like `50%`) (required)
- **`RETRIES`** - Number of times to retry failed tests (required)
- **`REPEAT_EACH`** - Number of times to repeat each test (`0` = disabled) (required)
- **`FULLY_PARALLEL`** - Run tests fully parallel (`true` or `false`) (required)
- **`FORBID_ONLY`** - Prevent test.only() from running (`true` or `false`)
- **`MAX_FAILURES`** - Maximum number of test failures before stopping (`0` = unlimited)

**Browser Selection:**

- **`CHROMIUM`** - Enable/disable Chromium browser tests (`1` = enabled, empty = disabled)
- **`FIREFOX`** - Enable/disable Firefox browser tests (`1` = enabled, empty = disabled)
- **`WEBKIT`** - Enable/disable WebKit browser tests (`1` = enabled, empty = disabled)
- **`BROWSER_CHANNEL`** - Browser channel (e.g., `chrome`, `msedge`, `chrome-beta`)

**Browser Behavior:**

- **`HEADED`** - Run tests in headed mode (`1` = headed, empty = headless)
- **`SLOW_MO`** - Slow down operations by specified milliseconds for debugging (`0` = disabled)
- **`BROWSER_ARGS`** - Browser launch arguments (comma-separated)

**Viewport & Device:**

- **`VIEWPORT_WIDTH`** / **`VIEWPORT_HEIGHT`** - Viewport dimensions in pixels
- **`DEVICE_SCALE_FACTOR`** - Device scale factor (1 = normal, 2 = retina)
- **`USER_AGENT`** - Custom user agent string
- **`LOCALE`** - Browser locale (e.g., `en-US`, `de-DE`)
- **`TIMEZONE_ID`** - Timezone (e.g., `America/New_York`, `Europe/Berlin`)
- \*\*`GEOLOCATION`
