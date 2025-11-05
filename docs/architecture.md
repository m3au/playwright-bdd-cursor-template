# Architecture Documentation <!-- omit from toc -->

This document describes the architecture and design decisions for the technical challenge test automation project.

![Placeholder](https://placecats.com/millie_neo/400/200)

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
- [Deployment \& Quality Architecture](#deployment--quality-architecture)
  - [CI/CD Workflow Architecture](#cicd-workflow-architecture)

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
    M -->|Reads from| N[Environment Variables .env]
    E -->|Provides| P[Config Data]

    D -->|Interacts with| I[Web Application]
    I -->|Target App| J[Cable Guy Tool]

    K[Playwright Config] -->|Configures| C
    K -->|Populates| N
    D -->|Reads config from| N

    C -->|Produces| R[Test Reports]
```

The system follows a layered architecture where Gherkin feature files drive test generation, POMs encapsulate page interactions, and fixtures provide dependency injection. Environment configuration flows from `.env` files through Playwright config into the test runtime, ensuring consistent behavior across local and CI/CD environments.

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
    NPM->>BDDGen: pretest hook (Automatic): bunx bddgen
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

The test execution follows a **fully automated flow** where a single command (`bun test`) triggers code generation, browser automation, and reporting. The `bddgen` pretest hook eliminates manual code generation steps, ensuring Gherkin feature files are always synchronized with executable test code before each test run.

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
    M -->|Reads| N[Environment Variables process.env]
    M -->|Returns| E[Config Object]
    C -->|Provides| E

    D -->|Provides| G[CableConfiguratorPage]
    D -->|Provides| H[CableSelectorPopup]
    D -->|Provides| I[CookieBanner]
    D -->|Provides| J[ProductDetailPage]

    L[Playwright Config] -->|Populates| N
    K[POMs] -->|Reads| N
```

The fixture system centralizes dependency management and ensures consistent test isolation across all test runs.

**World Fixture**: Provides `world` object containing:

- **`world.page`**: Playwright page instance
- **`world.data`**: Processed environment configuration object (via `getEnvironment()` function)
- **`world.testContext`**: Test context object for tracking test steps and state (used for bug reporting)
- **`world.testInfo`**: Playwright TestInfo instance for test metadata and attachments

The fixture calls `getEnvironment()` which reads from `process.env` and returns a structured configuration object.

**Environment Variables**: All configuration is read from `.env` files loaded via `dotenv`:

- **Local development**: Uses `.env` (copied from `.env.example`)
- **CI/CD**: Uses `.env.production` with overrides from workflow env vars
- **Error handling**: All Playwright configs throw errors if `.env` is missing
- **No defaults**: All values must be provided in `.env` files (no hardcoded defaults in code)

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

**Traditional BDD approach ❌** (indirection) requires separate step definition files:

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

**Decorator approach ✅** (direct co-location) maps steps directly in POM classes:

```typescript
import { Fixture, Given, When, Then, Step } from '@world';

@Fixture('CableConfiguratorPage')
export class CableConfiguratorPage {
  constructor(protected page: Page) {}

  @When('I click the cable beginning button')
  async clickCableBeginning(): Promise<void> {
    await this.iVerifyCableConfiguratorReady();
    await this.page.getByRole('button', { name: 'cable beginning' }).click();
  }

  @Step
  private async iVerifyCableConfiguratorReady(): Promise<void> {
    // Internal step that appears in test reports
    await expect(this.page.locator('.cg-configurator')).toBeVisible();
  }
}
```

**Key decorators:**

- **`@Step`**: **Custom innovation** - decorator we created for internal helper methods that should appear in Playwright test reports with structured visibility (defined in `tests/utils/decorators.ts`)
- **`@Fixture`**: Registers the POM class for dependency injection
- **`@Given`, `@When`, `@Then`**: Map Gherkin steps to methods (from playwright-bdd)

This **eliminates** the intermediate step definition layer, co-locating step text with implementation and reducing boilerplate. The custom `@Step` decorator enables granular test reporting for internal helper methods without exposing them as Gherkin steps.

### Decorator Mapping

- **`@Given`**: Setup steps (e.g., "Given I navigate to...")
- **`@When`**: Action steps (e.g., "When I click...")
- **`@Then`**: Assertion steps (e.g., "Then I should see...")

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

Decorators bridge the gap between Gherkin's human-readable syntax and executable code, providing compile-time validation and eliminating runtime step resolution overhead.

## Deployment & Quality Architecture

This section covers the CI/CD workflows, quality gates, and local development tools for ensuring production-ready test automation.

### CI/CD Workflow Architecture

The project uses modular GitHub Actions workflows for CI/CD orchestration, test execution, and automated report publishing. For detailed workflow structure, local testing instructions, and configuration details, see the [CI/CD Workflow Structure section in Development Guide](./development.md#cicd-workflow-structure).
