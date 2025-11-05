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
    - [CI vs Local Configuration Differences](#ci-vs-local-configuration-differences)
- [Resources](#resources)

---

## Development Setup

### Prerequisites

- **Node.js**: >= 24.0.0
- **Bun**: >= 1.3.1 (package manager and runtime)
- **Git**: Latest version

### Installation

```bash
# Clone the repository
git clone https://github.com/m3au/tech-challenge.git
cd tech-challenge

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

| Command       | Suite      | Purpose                                               |
| :------------ | :--------- | :---------------------------------------------------- |
| `bun test`    | E2E / Unit | Runs all E2E tests (or unit tests, per `bunfig.toml`) |
| `bun ui`      | E2E        | Run tests in UI mode                                  |
| `bun headed`  | E2E        | Run tests in headed mode (visible browser)            |
| `bun debug`   | E2E        | Run tests in debug mode (with Playwright Inspector)   |
| `bun failed`  | E2E        | Run only failed tests                                 |
| `bun pretest` | E2E        | Generate test files from BDD features (pre-step)      |

Unit tests use Bun's built-in test runner and achieve 100% code coverage for utility functions (`tests/utils/`) and scripts (`scripts/`). Tests are located in `tests/unit/` and `bunfig.toml` is configured with `root = "tests/unit"` so `bun test` only runs unit tests. Coverage is enabled by default, with `tests/utils/decorators.ts` excluded from coverage due to Bun's tooling limitations with decorators.

Unit tests cover all utility modules (attachments, browser-project, bug-reporter, decorators, environment, format, locators, network, pagination, random) and all scripts (bump-version, changelog, lint, pin-versions).

- Unit tests run automatically before every commit (pre-commit hook)
- Unit tests run first in CI/CD before other tests (E2E, Lighthouse, Axe)

### Local Workflow Testing

Test GitHub Actions workflows locally using [act](https://github.com/nektos/act):

```bash
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

**Secrets:**

- Workflows use `BASE_URL` from GitHub Actions secrets
- For local testing with act, ensure `.env` file contains `BASE_URL`
- Act reads secrets from `.env` file via `--secret-file .env`

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

```bash
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

```bash
git commit --no-verify
```

## AI Assistance

This project is configured for AI-assisted development with Cursor IDE. Rules guide AI assistants to follow project conventions and maintain code quality.

**Quick Start**: Rules automatically apply when editing files (context-aware based on file patterns). Use `@browser` for browser automation, `@playwright` for Playwright test features.

For detailed configuration, rules, and MCP integrations, see [AI Tuning Documentation](./ai-tuning.md).

## Writing Tests

### Adding a New Feature

1. Create a `.feature` file in `tests/e2e/features/`
2. Write Gherkin scenarios
3. Implement step definitions in POMs using decorators

### Adding a New Page Object Model

1. Create a new file in `tests/e2e/poms/pages/` or `tests/e2e/poms/components/`
2. Use `@Fixture` decorator to register the POM (use PascalCase for fixture name matching class name)
3. Use `@Given`, `@When`, `@Then` decorators for step definitions
4. Use `@Step` decorator for internal helper methods (imported from `@world`, defined in `tests/utils/decorators.ts`)
5. Register the POM fixture in `tests/e2e/world.ts`

For a complete implementation example, refer to `tests/e2e/poms/pages/configurator-page.ts`.

### Best Practices

1. **Use Page Object Model Pattern**: All page interactions go through POMs
2. **Use Decorators**: Step definitions are decorators on POM methods
3. **PascalCase Fixtures**: Fixture names should match class names (e.g., `@Fixture('CableConfiguratorPage')`)
4. **Wait Strategically**: Use Playwright's built-in waiting mechanisms
5. **Follow BDD Conventions**: Given/When/Then structure
6. **Step Naming**: Always start steps with **"I"** (e.g., "I navigate", "I click", "I see")
7. **Avoid "should"**: Use **"I see"** instead of "I should see"
8. **One Action Per Step**: Never use **"and"/"or"** in the middle of a step description

### Test Data

- Use environment variables for configuration
- Keep test data in `tests/e2e/data/`
- Avoid hardcoded values

### Debugging Tests

```bash
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

```bash
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

```bash
bun pin
```

### Updating Dependencies

```bash
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

The `.env` file supports the following configuration options:

- **`BASE_URL`** - Base URL for the application under test (e.g., `https://www.company.de/page.html`)
- **`TIMEOUT`** - Global timeout for all Playwright actions in milliseconds
- **`EXPECT_TIMEOUT`** - Timeout for assertions in milliseconds
- **`WORKERS`** - Number of parallel test workers (number or percentage like `50%`; percentage is calculated based on machine CPU cores)
- **`RETRIES`** - Number of times to retry failed tests
- **`REPEAT_EACH`** - Number of times to repeat each test (`0` = disabled)
- **`HEADED`** - Run tests in headed mode (show browser window) - set to `1` for headed, empty for headless
- **`SLOW_MO`** - Slow down operations by specified milliseconds for debugging
- **`CHROMIUM`** - Enable/disable Chromium browser tests - set to `1` for enabled, empty for disabled
- **`FIREFOX`** - Enable/disable Firefox browser tests - set to `1` for enabled, empty for disabled
- **`WEBKIT`** - Enable/disable WebKit browser tests - set to `1` for enabled, empty for disabled
- **`SCREENSHOT`** - Screenshot capture mode (`off`, `on`, `only-on-failure`)
- **`FULLY_PARALLEL`** - Run tests fully parallel (`true` or `false`)
- **`LIGHTHOUSE_PERFORMANCE`** - Lighthouse performance score (0 to 1, where 1 = 100%)
- **`LIGHTHOUSE_ACCESSIBILITY`** - Lighthouse accessibility score (0 to 1)
- **`LIGHTHOUSE_BEST_PRACTICES`** - Lighthouse best practices score (0 to 1)
- **`LIGHTHOUSE_SEO`** - Lighthouse SEO score (0 to 1)
- **`LIGHTHOUSE_PWA`** - Lighthouse PWA score (0 to 1)
- **`AXE_MAX_VIOLATIONS`** - Maximum allowed accessibility violations for Axe tests
- **`TRACE`** - Trace mode for debugging (`off`, `on`, `on-first-retry`, `retain-on-failure`, `on-all-retries`)

**CI/CD Configuration:**

- CI uses `.env.production` (committed to repo) with production defaults
- `BASE_URL` is overridden from GitHub Secrets (Repository → Settings → Secrets and variables → Actions → New repository secret)
- Audit tests override `WORKERS=1` via workflow env vars to avoid rate limiting

#### CI vs Local Configuration Differences

| **Setting**   | **Local** (`.env.example`) | **CI** (`.env.production`) | **Notes**                                       |
| :------------ | :------------------------- | :------------------------- | :---------------------------------------------- |
| `WORKERS`     | `50%`                      | `50%`                      | CI uses sharding (`--shard=1/2`, `--shard=2/2`) |
| `REPEAT_EACH` | `0`                        | `30`                       | CI repeats tests 30 times for reliability       |
| `RETRIES`     | `1`                        | `0`                        | CI uses REPEAT_EACH instead of retries          |
| `TIMEOUT`     | `40000`                    | `45000`                    | CI has longer timeout for network delays        |
| `TRACE`       | `on-first-retry`           | `on`                       | CI generates traces for all tests               |

Additionally, CI automatically sets `forbidOnly: true` in `playwright.config.ts` and uses different reporters (`['line'], ['blob'], ['github']`) instead of HTML reports for better CI integration.

**CI/CD Workflow Structure:**

The project uses modular GitHub Actions workflows:

- **`ci.yml`**: Main orchestrator workflow that calls other workflows and publishes reports to GitHub Pages
- **`unit-tests.yml`**: Unit tests workflow (runs before other workflows)
- **`test.yml`**: E2E tests workflow (sharded for parallel execution)
- **`lighthouse.yml`**: Lighthouse performance audit workflow
- **`axe.yml`**: Axe accessibility audit workflow
- **`dependabot.yml`**: Dependabot workflow that automatically pins dependency versions when Dependabot creates PRs

Dependabot configuration is in `.github/dependabot.yml` (separate from workflow files). Dependabot is a GitHub feature that automatically creates pull requests for dependency updates.

Workflows can run independently or be orchestrated together via the main CI workflow. Each workflow supports both `push/pull_request` triggers and `workflow_call` for reusability.

**Dependabot:**

- Automated dependency updates configured via `.github/dependabot.yml` (configuration file, not a workflow)
- Dependabot workflow (`.github/workflows/dependabot.yml`) automatically pins dependency versions when Dependabot creates PRs
- Weekly updates scheduled for Mondays at 9:00 AM
- Automatically creates PRs with pinned versions

## Resources

**Testing:**

- [Playwright Documentation](https://playwright.dev/)
- [playwright-bdd Documentation](https://github.com/vitalets/playwright-bdd)
- [Axe Accessibility Testing](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)

**Language & Runtime:**

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Bun Documentation](https://bun.sh/docs)

**Code Quality:**

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [CSpell Documentation](https://cspell.org/)
- [markdownlint Rules](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md)
- [SonarJS Rules](https://github.com/SonarSource/eslint-plugin-sonarjs)
- [Unicorn Rules](https://github.com/sindresorhus/eslint-plugin-unicorn)

**CI/CD:**

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [act Documentation](https://github.com/nektos/act) - Local GitHub Actions workflow testing
- [Docker Documentation](https://docs.docker.com/) - Container platform for act

**BDD & Testing Patterns:**

- [Gherkin Syntax Reference](https://cucumber.io/docs/gherkin/reference/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)

**Environment Configuration:**

- [dotenv Documentation](https://github.com/motdotla/dotenv)

**Git Hooks & Workflow:**

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/lint-staged/lint-staged)
