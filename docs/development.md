# Development Guide <!-- omit from toc -->

This guide provides setup instructions and development guidelines for the project.

![Placeholder](https://placecats.com/bella/400/200)

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
  - [Version Pinning](#version-pinning)
- [Troubleshooting](#troubleshooting)
  - [Tests Fail Locally But Pass in CI](#tests-fail-locally-but-pass-in-ci)
- [Configuration Files](#configuration-files)
  - [Test Configuration](#test-configuration)
  - [Environment Configuration](#environment-configuration)
- [Resources](#resources)

---

## Development Setup

### Prerequisites

- **Node.js**: >= 20.0.0
- **Bun**: >= 1.2.20 (package manager and runtime)
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

**E2E Tests:**

```bash
# Run all E2E tests
bun run test

# Run tests in UI mode
bun ui

# Run tests in headed mode (see browser)
bun headed

# Run tests in debug mode
bun debug

# Run only failed tests
bun failed

# Generate test files from BDD features
bun pretest
```

**Unit Tests:**

```bash
# Run unit tests (coverage enabled by default via bunfig.toml)
bun test
```

Unit tests use Bun's built-in test runner and achieve 100% code coverage for utility functions (`tests/e2e/utils/`). Tests are located in `tests/unit/` and cover:

- Unit tests run automatically before every commit (pre-commit hook)
- Unit tests run first in CI/CD before other tests (E2E, Lighthouse, Axe)

- String formatting utilities (`format.ts`)
- Random number generation (`random.ts`)
- Text validation utilities (`locators.ts`)

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

For detailed setup and troubleshooting, see [Act Testing Documentation](./act-testing.md).

### Code Quality

This project enforces high code quality standards through a combination of linting, formatting, type checking, and spell checking.

For detailed information on the tools and configuration, refer to the [Code Quality Files Reference](./code-quality.md).

**Editor Integration:**

- **Format on Save**: Enabled via VS Code workspace settings (Prettier for code, Markdownlint for markdown)
- **ESLint**: Auto-fix on save enabled
- **TypeScript**: Real-time type checking
- **CSpell**: Spell checking integrated into ESLint
- **EditorConfig**: Consistent formatting across editors

**Scripts:**

```bash
# Run all linters (type-check → ESLint → markdownlint)
bun lint

# Fix linting errors automatically (ESLint + markdownlint)
bun lint:fix

# Run individual linters
bun lint:typescript  # TypeScript type checking only
bun lint:eslint      # ESLint only
bun lint:markdown    # Markdown linting only
```

### Pre-commit Hooks

Husky Git hooks are configured to enforce code quality and commit message standards. They run `lint-staged` (ESLint, markdownlint, Prettier, CSpell) on `pre-commit` and TypeScript type checking on `pre-push`.

For more details on the Git hook configuration, refer to the [Code Quality Files Reference](./code-quality.md#pre-commit-hooks).

To bypass hooks temporarily:

```bash
git commit --no-verify
```

## AI Assistance

This project is configured for AI-assisted development with Cursor IDE. Rules guide AI assistants to follow project conventions and maintain code quality.

**Quick Start**:

- Rules automatically apply when editing files (context-aware based on file patterns)
- Use `@browser` for browser automation, `@playwright` for Playwright test features
- Configuration files: `.cursor/rules/` (rules), `.cursor/mcp.json` (MCP servers), `.cursorignore` (context exclusion)

For detailed information on AI configuration, rules, and MCP integrations, see [AI Tuning Documentation](./ai-tuning.md).

## Writing Tests

### Adding a New Feature

1. Create a `.feature` file in `tests/e2e/features/`
2. Write Gherkin scenarios
3. Implement step definitions in POMs using decorators

### Adding a New Page Object Model

1. Create a new file in `tests/e2e/poms/pages/` or `tests/e2e/poms/components/`
2. Use `@Fixture` decorator to register the POM (use PascalCase for fixture name matching class name)
3. Use `@Given`, `@When`, `@Then` decorators for step definitions
4. Use `@Step` decorator for internal helper methods (imported from `@world`, defined in `tests/e2e/utils/decorators.ts`)
5. Register the POM fixture in `tests/e2e/world.ts`

For a complete implementation example, refer to `tests/e2e/poms/pages/configurator-page.ts`.

### Best Practices

1. **Use Page Object Model Pattern**: All page interactions go through POMs
2. **Use Decorators**: Step definitions are decorators on POM methods
3. **PascalCase Fixtures**: Fixture names should match class names (e.g., `@Fixture('CableConfiguratorPage')`)
4. **Wait Strategically**: Use Playwright's built-in waiting mechanisms
5. **Follow BDD Conventions**: Given/When/Then structure
6. **Step Naming**: Always start steps with "I" (e.g., "I navigate", "I click", "I see")
7. **Avoid "should"**: Use "I see" instead of "I should see"
8. **One Action Per Step**: Never use "and"/"or" in the middle of a step description

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

- **`feat:`** commits → Minor version bump (0.1.0 → 0.2.0)
- **`fix:`** commits → Patch version bump (0.1.0 → 0.1.1)
- **`perf:`** commits → Patch version bump (0.1.0 → 0.1.1) - performance improvements
- **`refactor:`** commits → Patch version bump (0.1.0 → 0.1.1) - code refactoring
- **`BREAKING CHANGE`** or **`feat!:`** → Major version bump (0.1.0 → 1.0.0)
- Other commit types (`docs:`, `style:`, `test:`, `chore:`, `ci:`, `build:`) → No version bump

The `prepare-commit-msg` hook automatically:

1. Bumps `package.json` version based on commit type
2. Updates [`CHANGELOG.md`](../CHANGELOG.md) with the new entry
3. Stages both files for commit

No manual version management needed - just follow Conventional Commits format and versions are handled automatically.

## Dependencies

### Adding Dependencies

Add dependencies using standard Bun commands (`bun add <package-name>` or `bun add -d <package-name>` for dev dependencies).

**Important**: Always run `bun pin` after adding any dependency to pin versions to exact versions (see [Version Pinning](#version-pinning)).

### Updating Dependencies

```bash
# Update all dependencies
bun bump

# This runs: ncu -u && bun install && bun pin
```

### Version Pinning

**Important**: All dependencies must be pinned to exact versions (no `^` or `~`).

After adding a dependency, run:

```bash
bun pin
```

## Troubleshooting

### Tests Fail Locally But Pass in CI

- Check environment variables match CI values
- Verify timeout values are appropriate
- Ensure network connectivity
- Review browser version differences

## Configuration Files

### Test Configuration

- **`playwright.config.ts`**: Unified Playwright configuration with three projects:
  - `chromium`: Main E2E tests with BDD/Gherkin
  - `lighthouse`: Performance testing with Lighthouse
  - `axe`: Accessibility testing with Axe

The config includes error handling that throws if `.env` file is missing.

### Environment Configuration

**Files:**

- **`.env`**: Local environment file (gitignored, must be created manually)
- **`.env.example`**: Template for local development (copy to `.env`)
- **`.env.production`**: Production defaults for CI/CD (committed to repo, used in GitHub Actions workflows)

**Important**: All values must be provided via `.env` files (no hardcoded defaults in code). All Playwright configs throw errors if `.env` is missing or if required environment variables are not set.

**Environment Variables:**

The `.env` file supports the following configuration options:

- **`BASE_URL`** - Base URL for the application under test (e.g., `https://www.company.de`)
- **`TIMEOUT`** - Global timeout for all Playwright actions in milliseconds (default: `30000`)
- **`EXPECT_TIMEOUT`** - Timeout for assertions in milliseconds (default: `15000`)
- **`WORKERS`** - Number of parallel test workers (number or percentage like `50%`; percentage is calculated based on machine CPU cores, default: `50%`)
- **`RETRIES`** - Number of times to retry failed tests (default: `1`)
- **`REPEAT_EACH`** - Number of times to repeat each test (default: `0`, disabled)
- **`HEADED`** - Run tests in headed mode (show browser window) - `true` or `false` (default: `false`)
- **`SLOW_MO`** - Slow down operations by specified milliseconds for debugging (default: `0`)
- **`CHROMIUM_ENABLED`** - Enable/disable Chromium browser tests (`true` or `false`, default: `true`)
- **`FIREFOX_ENABLED`** - Enable/disable Firefox browser tests (`true` or `false`, default: `false`)
- **`WEBKIT_ENABLED`** - Enable/disable WebKit browser tests (`true` or `false`, default: `false`)
- **`SCREENSHOT`** - Screenshot capture mode (`off`, `on`, `only-on-failure`, default: `only-on-failure`)
- **`FULLY_PARALLEL`** - Run tests fully parallel (`true` or `false`, default: `true`)
- **`LIGHTHOUSE_PERFORMANCE_THRESHOLD`** - Lighthouse performance score threshold (0.0 to 1.0, where 1.0 = 100%, default: `0.0`)
- **`LIGHTHOUSE_ACCESSIBILITY_THRESHOLD`** - Lighthouse accessibility score threshold (0.0 to 1.0, default: `0.0`)
- **`LIGHTHOUSE_BEST_PRACTICES_THRESHOLD`** - Lighthouse best practices score threshold (0.0 to 1.0, default: `0.0`)
- **`LIGHTHOUSE_SEO_THRESHOLD`** - Lighthouse SEO score threshold (0.0 to 1.0, default: `0.0`)
- **`AXE_MAX_VIOLATIONS`** - Maximum allowed accessibility violations for Axe tests (default: `0`)
- **`TRACE`** - Trace mode for debugging (`off`, `on`, `on-first-retry`, `retain-on-failure`, `on-all-retries`, default: `on-first-retry`)

**CI/CD Configuration:**

- CI uses `.env.production` (committed to repo) with production defaults
- `BASE_URL` is overridden from GitHub Secrets (Repository → Settings → Secrets and variables → Actions → New repository secret)
- Audit tests override `WORKERS=1` via workflow env vars to avoid rate limiting

**CI/CD Workflow Structure:**

The project uses modular GitHub Actions workflows:

- **`ci.yml`**: Main orchestrator workflow that calls other workflows
- **`test.yml`**: E2E tests workflow (sharded for parallel execution)
- **`lighthouse.yml`**: Lighthouse performance audit workflow
- **`axe.yml`**: Axe accessibility audit workflow
- **`publish.yml`**: Report publishing workflow (GitHub Pages)
- **`dependabot.yml`**: Dependabot workflow that automatically pins dependency versions

Dependabot configuration is in `.github/dependabot.yml` (separate from the workflow file).

Workflows can run independently or be orchestrated together via the main CI workflow. Each workflow supports both `push/pull_request` triggers and `workflow_call` for reusability.

**Dependabot:**

- Automated dependency updates configured via `.github/dependabot.yml` (configuration file)
- Dependabot workflow (`.github/workflows/dependabot.yml`) automatically pins dependency versions in PRs
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
