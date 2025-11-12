import { expect, type Page, type Locator } from '@world';

/**
 * Base Page Component
 * Provides common page verification functionality
 * All page POMs can extend or compose this for consistent page title verification
 */
export class BasePage {
  protected pageTitleLocator: Locator;

  constructor(protected page: Page) {
    // Most pages use h3 for page title
    this.pageTitleLocator = this.page.getByRole('heading', { level: 3 });
  }

  /**
   * Verify page is loaded by checking page title visibility and text
   * This is a helper method, not a step definition, so it's not decorated with @Step
   */
  async verifyPageLoaded(expectedTitle: string, timeout = 10_000): Promise<void> {
    await expect(this.pageTitleLocator).toBeVisible({ timeout });
    await expect(this.pageTitleLocator).toHaveText(expectedTitle);
  }
}
