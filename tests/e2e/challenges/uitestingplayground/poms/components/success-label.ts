import { Step, expect, type Page, type Locator } from '@world';

/**
 * Success Label Component
 * Handles success labels that appear after AJAX requests or client-side processing
 * Uses the `.bg-success` class pattern from UITestingPlayground
 */
export class SuccessLabel {
  private loadedLabelLocator: Locator;

  constructor(protected page: Page) {
    // Label appears after AJAX request or client-side processing completes
    this.loadedLabelLocator = this.page.locator('.bg-success');
  }

  /**
   * Wait for the success label to appear and have content
   */
  @Step
  async waitForLabelToAppear(timeout = 20_000): Promise<void> {
    await expect(this.loadedLabelLocator).toBeVisible({ timeout });
    // Wait for text content to be loaded
    await expect(this.loadedLabelLocator).toHaveText(/.+/, { timeout: 5000 });
  }

  /**
   * Click on the loaded success label
   */
  @Step
  async clickLabel(): Promise<void> {
    await expect(this.loadedLabelLocator).toBeVisible({ timeout: 10_000 });
    await this.loadedLabelLocator.click();
  }

  /**
   * Verify the label is visible (for verification steps)
   */
  @Step
  async verifyLabelVisible(): Promise<void> {
    await expect(this.loadedLabelLocator).toBeVisible();
  }

  /**
   * Get the text content of the label
   */
  @Step
  async getLabelText(): Promise<string> {
    await expect(this.loadedLabelLocator).toBeVisible({ timeout: 10_000 });
    const text = await this.loadedLabelLocator.textContent();
    return text || '';
  }
}
