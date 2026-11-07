import { Step, expect, type Locator, type Page } from '@world';

const DISMISS_BUTTON_SELECTORS = [
  /accept all/i,
  /^consent$/i,
  /allow all/i,
  /confirm choices/i,
  /consent/i,
];

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
    if (!(await this.waitUntilPageCanShowConsent())) {
      return;
    }

    if (!(await this.isConsentDisplayed())) {
      return;
    }

    if (await this.clickFirstDismissButton()) {
      return;
    }

    await this.dismissWithEscape();
  }

  private async waitUntilPageCanShowConsent(): Promise<boolean> {
    if (this.page.isClosed()) {
      return false;
    }

    try {
      await this.overlayLocator
        .or(this.consentRootLocator)
        .waitFor({ state: 'visible', timeout: 500 })
        .catch(() => {});
    } catch (error) {
      if (this.page.isClosed()) {
        return false;
      }
      throw error;
    }

    return !this.page.isClosed();
  }

  private async clickFirstDismissButton(): Promise<boolean> {
    for (const button of this.dismissButtons) {
      if (this.page.isClosed()) {
        return false;
      }
      if (!(await button.isVisible({ timeout: 2000 }).catch(() => false))) {
        continue;
      }

      try {
        // The consent overlay intercepts pointer events, so a normal click never reaches the button.
        // eslint-disable-next-line playwright/no-force-option -- overlay blocks the button
        await button.click({ force: true }).catch(() => button.click());
        await this.waitForConsentToDisappear();
        return true;
      } catch (error) {
        if (this.page.isClosed()) {
          return false;
        }
        throw error;
      }
    }

    return false;
  }

  private async dismissWithEscape(): Promise<void> {
    if (this.page.isClosed()) {
      return;
    }

    try {
      await this.page.keyboard.press('Escape');
      await this.waitForConsentToDisappear();
    } catch (error) {
      if (this.page.isClosed()) {
        return;
      }
      throw error;
    }
  }

  private async isConsentDisplayed(): Promise<boolean> {
    const overlayVisible = await this.overlayLocator.isVisible().catch(() => false);
    const rootVisible = await this.consentRootLocator.isVisible().catch(() => false);
    return overlayVisible || rootVisible;
  }

  private async waitForConsentToDisappear(): Promise<void> {
    if (this.page.isClosed()) {
      return;
    }
    try {
      await expect(this.overlayLocator).toBeHidden({ timeout: 10_000 });
      await expect(this.consentRootLocator).toBeHidden({ timeout: 10_000 });
    } catch (error) {
      if (this.page.isClosed()) {
        return;
      }
      throw error;
    }
  }
}
