# Architecture Documentation <!-- omit from toc -->

This document describes the architecture and design decisions for the technical challenge test automation project.

![Placeholder](https://placecats.com/millie/400/200)

## Table of Contents <!-- omit from toc -->

- [System Architecture](#system-architecture)
- [Test Execution Flow](#test-execution-flow)
- [Component Architecture](#component-architecture)
  - [Page Object Models](#page-object-models)
  - [Fixture System](#fixture-system)
  - [Component Interaction](#component-interaction)
- [Step Definition Pattern](#step-definition-pattern)
  - [Traditional Approach vs Decorator Approach](#traditional-approach-vs-decorator-approach)
  - [Decorator Mapping](#decorator-mapping)
  - [Step Definition Flow](#step-definition-flow)
  - [Implementation Example](#implementation-example)
- [Test Data Flow](#test-data-flow)

---

## System Architecture

```mermaid
graph TB
    A[Feature Files] -->|Gherkin BDD| B[playwright-bdd]
    B -->|Generates| C[Test Files]
    C -->|Uses| D[Page Object Models]
    D -->|Injected via| E[Fixtures]
    E -->|Provides| F[Page Instance]
    E -->|Calls| M[getEnvironment Function]
    M -->|Reads from| N[process.env]

    D -->|Interacts with| I[Web Application]
    I -->|Company Website| J[Cable Guy Tool]

    K[Playwright Config] -->|Configures| C
    K -->|Populates| N[Environment Configuration]
    D -->|Reads from| N
```

## Test Execution Flow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant NPM as npm/bun
    participant BDDGen as bddgen
    participant Playwright as Playwright
    participant POM as Page Object Model
    participant Browser as Browser
    participant Site as Company Website

    Dev->>NPM: bun test
    NPM->>BDDGen: pretest hook: bunx bddgen
    BDDGen->>BDDGen: Generate test files to test-output/bdd-gen/
    BDDGen-->>NPM: Files generated
    NPM->>Playwright: playwright test
    Playwright->>Browser: Launch browser
    Browser->>Site: Navigate to Cable Guy
    Site-->>Browser: Page loaded
    Browser->>POM: Execute step definitions
    POM->>Browser: Interact with page
    Browser->>Site: User actions
    Site-->>Browser: Page updates
    Browser-->>POM: Verification results
    POM-->>Playwright: Test results
    Playwright-->>Dev: Test report
```

## Component Architecture

The test framework uses a layered architecture combining Page Object Models (POMs), Playwright fixtures, and BDD decorators for dependency injection and step definition mapping.

### Page Object Models

POMs encapsulate page interactions and define step definitions using decorators:

- **`CableConfiguratorPage`**: Main application interactions with cable selection, manufacturer filtering, and basket functionality
- **`CableSelectorPopup`**: Cable selector popup dialog interactions
- **`CookieBanner`**: Cookie banner dialog handling
- **`ProductDetailPage`**: Product detail page interactions

Each POM:

- Takes a `Page` instance in its constructor
- Uses decorators (`@Given`, `@When`, `@Then`) to define step implementations
- Registers itself with `@Fixture` decorator for dependency injection

### Fixture System

Fixtures provide dependency injection, connecting POMs to test context and environment configuration:

```mermaid
graph LR
    A[Playwright Test] -->|Extends| B[Base Fixtures]
    B -->|Adds| C[World Fixture]
    B -->|Adds| D[Page Fixtures]

    C -->|Provides| F[Page Instance]
    C -->|Calls| M[getEnvironment Function]
    M -->|Reads| N[process.env]
    M -->|Returns| E[Config Object]
    C -->|Provides| E

    D -->|Provides| G[CableConfiguratorPage]
    D -->|Provides| H[CableSelectorPopup]
    D -->|Provides| I[CookieBanner]
    D -->|Provides| J[ProductDetailPage]

    L[Playwright Config] -->|Populates| N[process.env]
    K[POMs] -->|Reads| N
```

**World Fixture**: Provides `world` object containing:

- `world.page`: Playwright page instance
- `world.data`: Processed environment configuration object (via `getEnvironment()` function)

The fixture calls `getEnvironment()` which reads from `process.env` and returns a structured configuration object.

**Environment Variables**: All configuration is read from `.env` files loaded via `dotenv`:

- **Local development**: Uses `.env` (copied from `.env.example`)
- **CI/CD**: Uses `.env.production` with overrides from workflow env vars
- **Error handling**: All Playwright configs throw errors if `.env` is missing
- **No defaults**: All values must be provided in `.env` files (no hardcoded defaults in code)

**CI/CD Workflow Architecture**:

The project uses modular GitHub Actions workflows for CI/CD:

- **`ci.yml`**: Main orchestrator workflow that coordinates test, lighthouse, and axe workflows
- **`test.yml`**: E2E tests workflow with sharding for parallel execution
- **`lighthouse.yml`**: Lighthouse performance audit workflow
- **`axe.yml`**: Axe accessibility audit workflow
- **`publish.yml`**: Report publishing workflow for GitHub Pages
- **`dependabot.yml`**: Dependabot workflow that automatically pins dependency versions

Dependabot configuration is in `.github/dependabot.yml` (separate from the workflow file).

Workflows can run independently or be orchestrated together via the main CI workflow. Each workflow supports both `push/pull_request` triggers and `workflow_call` for reusability.

**Local Workflow Testing**:

GitHub Actions workflows can be tested locally using [act](https://github.com/nektos/act) via Makefile targets:

- `make test` - Test E2E tests workflow locally (verbose output)
- `make lighthouse` - Test Lighthouse audit workflow locally
- `make axe` - Test Axe audit workflow locally
- `make publish` - Test publish reports workflow locally
- `make ci` - Test main CI workflow locally
- `make test-dryrun` - Dry run for workflow validation

See [Act Testing Documentation](./act-testing.md) for detailed setup and usage.

Variables from `process.env` are consumed by:

- Playwright config (test configuration like `TIMEOUT`, `WORKERS`, `BASE_URL`)
- Fixtures (via `getEnvironment()` function which processes `process.env` into structured config)
- POMs (for direct `BASE_URL` access)

**Note**: Audit test suites (`axe.spec.ts`, `lighthouse.spec.ts`) run as separate projects in the unified `playwright.config.ts`, but are not part of the core BDD test architecture.

**Page Fixtures**: Instantiates and injects POM instances into step definitions via dependency injection.

Playwright fixtures provide structured dependency injection:

- Separates concerns: POM instantiation separate from step logic
- Ensures test isolation: Each test gets fresh POM instances
- Centralizes environment configuration loading
- Provides type safety via TypeScript interfaces

### Component Interaction

1. **BDD generates test files** from Gherkin feature files
2. **Generated tests** import fixtures that extend Playwright's test
3. **Step definitions** receive POM instances via fixture parameters
4. **POM methods** (decorated with `@Given`/`@When`/`@Then`) implement step logic
5. **POMs interact** with Playwright's Page API to control the browser

## Step Definition Pattern

Step definitions use playwright-bdd decorators to map Gherkin steps directly to POM methods, eliminating the need for separate step definition files (`steps.ts`).

### Traditional Approach vs Decorator Approach

**Traditional BDD approach** requires separate step definition files:

```typescript
// steps.ts (traditional approach)
import { Given, When, Then } from '@cucumber/cucumber';
import { ConfiguratorPage } from '../poms/pages/configurator-page';

Given('I navigate to the configurator page', async function () {
  const page = new ConfiguratorPage(this.page);
  await page.navigate();
});
```

This creates **indirection**: Gherkin → step definition file → POM method, requiring manual wiring and maintaining synchronization between step text and implementation.

**Decorator approach** maps steps directly in POM classes:

```typescript
// configurator-page.ts (decorator approach)
@Fixture('CableConfiguratorPage')
export class CableConfiguratorPage {
  @Given('I navigate to the configurator page')
  async navigate() {
    await this.page.goto('/intl/cableguy.html');
  }
}
```

This **eliminates** the intermediate step definition layer, co-locating step text with implementation and reducing boilerplate.

### Decorator Mapping

- **`@Given`**: Setup steps ("Given I navigate to...")
- **`@When`**: Action steps ("When I click...")
- **`@Then`**: Assertion steps ("Then I should see...")
- **`@Fixture`**: Registers POM class for dependency injection
- **`@Step`**: Custom decorator for internal helper methods that should appear in Playwright test reports (defined in `tests/e2e/utils/decorators.ts`, re-exported from `@world`)

### Step Definition Flow

```mermaid
sequenceDiagram
    participant G as Gherkin Step
    participant BDD as playwright-bdd
    participant F as Fixture
    participant POM as Page Object Model
    participant P as Playwright Page

    G->>BDD: "Given I navigate to..."
    BDD->>F: Resolve step definition
    F->>POM: Inject POM instance
    POM->>POM: Execute @Given method
    POM->>P: page.goto(...)
    P-->>POM: Page loaded
    POM-->>BDD: Step complete
```

### Implementation Example

```typescript
@Fixture('CableConfiguratorPage')
export class CableConfiguratorPage {
  constructor(protected page: Page) {}

  @Given('I navigate to the configurator page')
  async navigate() {
    await this.page.goto('/intl/cableguy.html');
  }
}
```

The `@Fixture` decorator registers the class, allowing step definitions to receive it as a parameter. The `@Given` decorator maps the Gherkin text to the method implementation.

**Rationale**: Traditional BDD frameworks require separate `steps.ts` files that manually wire Gherkin steps to POM methods, creating indirection and maintenance overhead. Using decorators directly on POM methods eliminates the intermediate layer, co-locates step text with implementation, and reduces sync issues between step definitions and implementations.

## Test Data Flow

```mermaid
sequenceDiagram
    participant Feature as Feature File
    participant Step as Step Definition
    participant POM as Page Object Model
    participant Page as Playwright Page
    participant Site as Company Website

    Feature->>Step: Given/When/Then
    Step->>POM: Decorated Method
    POM->>Page: Locator/Action
    Page->>Site: HTTP Request
    Site-->>Page: Response
    Page-->>POM: Element/Result
    POM-->>Step: Assertion/Result
    Step-->>Feature: Test Status
```
