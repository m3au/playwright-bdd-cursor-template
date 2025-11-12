import { Fixture, Then, When, Step, expect, type Page, type Locator } from '@world';

@Fixture('ClickPage')
export class ClickPage {
  private pageTitleLocator: Locator;
  private buttonLocator: Locator;

  constructor(protected page: Page) {
    this.pageTitleLocator = this.page.getByRole('heading', { level: 3 });
    this.buttonLocator = this.page.getByRole('button', {
      name: 'Button That Ignores DOM Click Event',
    });
  }

  @Then('I see the Click page')
  async verifyPageLoaded(): Promise<void> {
    await this.iSeeTheClickPage();
  }

  @Step
  private async iSeeTheClickPage(): Promise<void> {
    await expect(this.pageTitleLocator).toBeVisible({ timeout: 10_000 });
    await expect(this.pageTitleLocator).toHaveText('Click');
  }

  @When('I click the button that ignores DOM click event')
  async clickButton(): Promise<void> {
    await this.iClickTheButton();
  }

  @Step
  private async iClickTheButton(): Promise<void> {
    await expect(this.buttonLocator).toBeVisible({ timeout: 10_000 });
    await expect(this.buttonLocator).toBeEnabled({ timeout: 10_000 });
    // Button ignores DOM click events, force is needed to bypass the event listener check
    // eslint-disable-next-line playwright/no-force-option -- Button specifically designed to test force clicks
    await this.buttonLocator.click({ force: true });
  }

  @Then('the button becomes green')
  async verifyButtonBecomesGreen(): Promise<void> {
    await this.iVerifyButtonBecomesGreen();
  }

  @Step
  private async iVerifyButtonBecomesGreen(): Promise<void> {
    // Button changes class or style to green after click
    // Check for success class or background color
    await expect(this.buttonLocator).toHaveClass(/success|btn-success/, { timeout: 5000 });
  }
}
