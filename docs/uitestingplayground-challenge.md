# UITestingPlayground Challenge

## Overview

The **UITestingPlayground Challenge** is a comprehensive test automation suite covering **23 real-world UI testing scenarios** from [UITestingPlayground](http://uitestingplayground.com/). This challenge demonstrates various automation challenges and best practices for handling complex UI interactions, timing issues, element identification, and advanced DOM structures.

**Status**: ✅ Complete – All 23 scenarios implemented

**Base URL**: `http://uitestingplayground.com` (configured via `BASE_URL_UITESTINGPLAYGROUND`)

## Test Scenarios

### Element Identification (5 scenarios)

These scenarios focus on robust element identification techniques that don't rely on fragile selectors:

1. **Dynamic ID** (`dynamic-id-page.ts`)

   - Challenge: Button has a dynamically generated ID that changes on each page load
   - Solution: Use stable attributes or text content instead of IDs
   - Feature: `element-identification.feature`

2. **Class Attribute** (`class-attribute-page.ts`)

   - Challenge: Complex class attributes with special characters
   - Solution: Use CSS selectors with proper escaping or attribute selectors
   - Feature: `element-identification.feature`

3. **Verify Text** (`verify-text-page.ts`)

   - Challenge: Text content split across multiple DOM nodes
   - Solution: Use text matching that handles partial text or filter by parent elements
   - Feature: `element-identification.feature`

4. **Non-Breaking Space** (`non-breaking-space-page.ts`)

   - Challenge: Button text contains non-breaking space characters (`&nbsp;`)
   - Solution: Use flexible text matching or normalize whitespace
   - Feature: `element-identification.feature`

5. **Sample App** (`sample-app-page.ts`)
   - Challenge: Login form with dynamically generated attributes
   - Solution: Use role-based selectors and accessible names
   - Feature: `element-identification.feature`

### Timing & Synchronization (7 scenarios)

These scenarios demonstrate proper waiting strategies for asynchronous operations:

6. **Load Delay** (`load-delay-page.ts`)

   - Challenge: Button appears after a server-side delay
   - Solution: Use Playwright's auto-waiting or explicit waits
   - Feature: `timing-synchronization.feature`

7. **AJAX Data** (`ajax-data-page.ts`)

   - Challenge: Content loaded via AJAX after button click
   - Solution: Wait for network response or element visibility
   - Feature: `timing-synchronization.feature`

8. **Client Side Delay** (`client-side-delay-page.ts`)

   - Challenge: JavaScript calculation delay before content appears
   - Solution: Wait for element state changes or text content
   - Feature: `timing-synchronization.feature`

9. **Progress Bar** (`progress-bar-page.ts`)

   - Challenge: Monitor and interact with animated progress indicator
   - Solution: Poll progress value and wait for target percentage
   - Feature: `timing-synchronization.feature`

10. **Animated Button** (`animated-button-page.ts`)

    - Challenge: Button moves during animation, must wait for completion
    - Solution: Wait for animation to complete before clicking
    - Feature: `timing-synchronization.feature`

11. **Disabled Input** (`disabled-input-page.ts`)

    - Challenge: Input field starts disabled, becomes enabled after action
    - Solution: Wait for element to become enabled before interaction
    - Feature: `timing-synchronization.feature`

12. **Auto Wait** (`auto-wait-page.ts`)
    - Challenge: Element becomes interactable after delay
    - Solution: Leverage Playwright's built-in auto-waiting mechanisms
    - Feature: `timing-synchronization.feature`

### Interaction Challenges (5 scenarios)

These scenarios handle complex user interaction patterns:

13. **Click** (`click-page.ts`)

    - Challenge: Button ignores standard DOM click events
    - Solution: Use force click or alternative interaction methods
    - Feature: `interaction-challenges.feature`

14. **Text Input** (`text-input-page.ts`)

    - Challenge: Input requires physical keyboard simulation
    - Solution: Use `pressSequentially()` for character-by-character input
    - Feature: `interaction-challenges.feature`

15. **Mouse Over** (`mouse-over-page.ts`)

    - Challenge: DOM changes triggered by hover events
    - Solution: Hover to trigger DOM update, then interact with new elements
    - Feature: `interaction-challenges.feature`

16. **Scrollbars** (`scrollbars-page.ts`)

    - Challenge: Button hidden outside viewport, requires scrolling
    - Solution: Scroll element into view before interaction
    - Feature: `interaction-challenges.feature`

17. **Overlapped Element** (`overlapped-element-page.ts`)
    - Challenge: Input field covered by another element
    - Solution: Scroll into view or use JavaScript to bring element forward
    - Feature: `interaction-challenges.feature`

### Advanced Challenges (6 scenarios)

These scenarios demonstrate advanced automation techniques:

18. **Dynamic Table** (`dynamic-table-page.ts`)

    - Challenge: Extract and verify values from dynamically populated table
    - Solution: Parse table structure and match values across rows/columns
    - Feature: `advanced-challenges.feature`

19. **Shadow DOM** (`shadow-dom-page.ts`)

    - Challenge: Interact with elements inside Shadow DOM
    - Solution: Use `locator.shadowRoot` or CSS selectors that pierce shadow boundaries
    - Feature: `advanced-challenges.feature`

20. **Visibility** (`visibility-page.ts`)

    - Challenge: Verify element visibility states (opacity, display, position)
    - Solution: Check multiple CSS properties that affect visibility
    - Feature: `advanced-challenges.feature`

21. **Hidden Layers** (`hidden-layers-page.ts`)

    - Challenge: Handle z-order stacking and overlapped elements
    - Solution: Understand DOM order and click the visible element
    - Feature: `advanced-challenges.feature`

22. **Alerts** (`alerts-page.ts`)

    - Challenge: Accept/dismiss browser dialogs and prompts
    - Solution: Set up dialog handlers before triggering actions
    - Feature: `advanced-challenges.feature`

23. **File Upload** (`file-upload-page.ts`)
    - Challenge: Upload files through iframe-based file inputs
    - Solution: Handle iframe context switching and file input interactions
    - Feature: `advanced-challenges.feature`

## Implementation Architecture

### Feature Files

All scenarios are organized into 4 feature files using Gherkin syntax:

```text
tests/e2e/challenges/uitestingplayground/features/
├── element-identification.feature      # 5 scenarios
├── timing-synchronization.feature     # 7 scenarios
├── interaction-challenges.feature      # 5 scenarios
└── advanced-challenges.feature         # 6 scenarios
```

### Page Object Models

Each scenario has a dedicated Page Object Model (POM) class:

```text
tests/e2e/challenges/uitestingplayground/poms/pages/
├── home-page.ts                        # Navigation hub
├── dynamic-id-page.ts
├── class-attribute-page.ts
├── verify-text-page.ts
├── non-breaking-space-page.ts
├── sample-app-page.ts
├── load-delay-page.ts
├── ajax-data-page.ts
├── client-side-delay-page.ts
├── progress-bar-page.ts
├── animated-button-page.ts
├── disabled-input-page.ts
├── auto-wait-page.ts
├── click-page.ts
├── text-input-page.ts
├── mouse-over-page.ts
├── scrollbars-page.ts
├── overlapped-element-page.ts
├── dynamic-table-page.ts
├── shadow-dom-page.ts
├── visibility-page.ts
├── hidden-layers-page.ts
├── alerts-page.ts
└── file-upload-page.ts
```

### Reusable Components

Shared components for common patterns:

```text
tests/e2e/challenges/uitestingplayground/poms/components/
├── alert-handler.ts                    # Dialog/alert handling utilities
├── success-label.ts                    # Success message verification
└── base-page.ts                       # Base class with common functionality
```

### World Fixture

The challenge-specific world fixture (`world.ts`) registers all 24 POM fixtures (HomePage + 23 challenge pages) for dependency injection:

```typescript
export const test = baseTest.extend<{
  HomePage: unknown;
  DynamicIdPage: unknown;
  ClassAttributePage: unknown;
  // ... all 23 challenge pages
}>({
  // Fixture implementations
});
```

## Key Implementation Patterns

### BDD Decorators

All step definitions use TypeScript decorators directly on POM methods:

```typescript
@Fixture('DynamicIdPage')
export class DynamicIdPage {
  @Given('I navigate to the Dynamic ID page')
  async navigateToPage(): Promise<void> {
    /* ... */
  }

  @When('I click the button with dynamic ID')
  async clickButton(): Promise<void> {
    /* ... */
  }

  @Then('the button click is successful')
  async verifySuccess(): Promise<void> {
    /* ... */
  }
}
```

### Step Helper Methods

Internal helper methods use `@Step` decorator for traceability:

```typescript
@Step
private async iClickTheButton(): Promise<void> {
  // Implementation details
}
```

### Base Page Pattern

Common functionality extracted to `BasePage` class:

```typescript
export abstract class BasePage {
  protected pageTitleLocator: Locator;

  @Step
  protected async iSeeThePage(title: string): Promise<void> {
    await expect(this.pageTitleLocator).toHaveText(title);
  }
}
```

### Alert Handling

Reusable alert handler component:

```typescript
@Step
async setUpAlertHandler(): Promise<void> {
  this.page.once('dialog', async (dialog) => {
    await dialog.accept();
  });
}
```

## Running Tests

### Run All UITestingPlayground Tests

```bash
bun run test:uitestingplayground
```

This command:

1. Runs `pretest` (generates BDD step files)
2. Executes all UITestingPlayground scenarios

### Run Specific Feature

```bash
bun run test -- --grep "Element Identification"
```

### Run in UI Mode

```bash
bun run ui -- --project=uitestingplayground-chromium
```

### Run in Headed Mode

```bash
bun run headed -- --project=uitestingplayground-chromium
```

## Test Data & Configuration

### Environment Variables

Required in `.env`:

```bash
BASE_URL_UITESTINGPLAYGROUND=http://uitestingplayground.com
TIMEOUT=30000
EXPECT_TIMEOUT=10000
```

### Test Isolation

- Each scenario is independent
- No shared state between tests
- Tests can run in any order
- Parallel execution supported

## Technical Highlights

### Robust Element Identification

- **Role-based selectors**: `getByRole('button', { name: 'Click Me' })`
- **Text matching**: Handles partial text, case-insensitive matching
- **Attribute selectors**: CSS selectors with proper escaping
- **Stable locators**: Avoid dynamic IDs, use semantic attributes

### Synchronization Strategies

- **Auto-waiting**: Leverage Playwright's built-in waits
- **Explicit waits**: `waitForSelector()`, `waitForResponse()`
- **State polling**: Check element states until condition met
- **Network monitoring**: Wait for AJAX requests to complete

### Advanced Techniques

- **Shadow DOM**: `locator.shadowRoot` for piercing shadow boundaries
- **Iframe handling**: Context switching for file uploads
- **Dialog management**: Pre-setup handlers before triggering actions
- **Clipboard operations**: Read/write clipboard for GUID scenarios
- **Dynamic table parsing**: Extract and verify table data programmatically

## Code Quality

- **100% TypeScript**: Full type safety with strict mode
- **BDD patterns**: Gherkin feature files with step definitions
- **POM architecture**: Encapsulated page interactions
- **Reusable components**: Shared utilities for common patterns
- **ESLint compliant**: Follows project code quality standards

## Continuous Integration

All 23 scenarios run automatically in CI/CD:

- **Pre-flight checks**: Lint + unit tests
- **E2E execution**: All UITestingPlayground scenarios
- **Parallel execution**: Multiple workers for speed
- **Report generation**: HTML reports with traces and screenshots

## References

- **Website**: [UITestingPlayground](http://uitestingplayground.com/)
- **Source Code**: `tests/e2e/challenges/uitestingplayground/`
- **Feature Files**: `tests/e2e/challenges/uitestingplayground/features/`
- **Page Objects**: `tests/e2e/challenges/uitestingplayground/poms/pages/`
