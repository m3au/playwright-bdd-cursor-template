import { Step, expect, type Locator, type Page } from '@world';

const DISMISS_BUTTON_SELECTORS = [/accept all/i, /^consent$/i, /allow all/i, /confirm choices/i];

export class CookieConsentModal {
  private readonly consentRootLocator: Locator;
  private readonly overlayLocator: Locator;
  private readonly dismissButtons: Locator[];

  constructor(private readonly page: Page) {
    this.consentRootLocator = this.page.locator('.fc-consent-root');
    this.overlayLocator = this.page.locator('.fc-dialog-overlay');
    this.dismissButtons = DISMISS_BUTTON_SELECTORS.map((pattern) =>
      this.page.getByRole('button', { name: pattern }),
    );
  }

  @Step
  async acceptAllIfPresent(): Promise<void> {
    if (!(await this.isConsentDisplayed())) {
      return;
    }

    for (const button of this.dismissButtons) {
      if (await button.isVisible().catch(() => false)) {
        await button.click();
        await this.waitForConsentToDisappear();
        return;
      }
    }

    // Fallback: try pressing Escape if known buttons are not visible
    await this.page.keyboard.press('Escape');
    await this.waitForConsentToDisappear();
  }

  private async isConsentDisplayed(): Promise<boolean> {
    const overlayVisible = await this.overlayLocator.isVisible().catch(() => false);
    const rootVisible = await this.consentRootLocator.isVisible().catch(() => false);
    return overlayVisible || rootVisible;
  }

  private async waitForConsentToDisappear(): Promise<void> {
    await expect(this.overlayLocator).toBeHidden({ timeout: 10_000 });
    await expect(this.consentRootLocator).toBeHidden({ timeout: 10_000 });
  }
}
