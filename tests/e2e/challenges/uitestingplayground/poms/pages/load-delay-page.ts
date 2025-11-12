import { Fixture, Then, When, Step, expect, type Page, type Locator } from '@world';

@Fixture('LoadDelayPage')
export class LoadDelayPage {
  private pageTitleLocator: Locator;
  private delayedButtonLocator: Locator;

  constructor(protected page: Page) {
    this.pageTitleLocator = this.page.getByRole('heading', { level: 3 });
    this.delayedButtonLocator = this.page.getByRole('button', {
      name: 'Button Appearing After Delay',
    });
  }

  @Then('I see the Load Delay page')
  async verifyPageLoaded(): Promise<void> {
    await this.iSeeTheLoadDelayPage();
  }

  @Step
  private async iSeeTheLoadDelayPage(): Promise<void> {
    await expect(this.pageTitleLocator).toBeVisible({ timeout: 10_000 });
    await expect(this.pageTitleLocator).toHaveText('Load Delays');
  }

  @When('I click the button appearing after delay')
  async clickDelayedButton(): Promise<void> {
    await this.iClickTheDelayedButton();
  }

  @Step
  private async iClickTheDelayedButton(): Promise<void> {
    await expect(this.delayedButtonLocator).toBeVisible({ timeout: 15_000 });
    await this.delayedButtonLocator.click();
  }

  @Then('the delayed button click is successful')
  async verifyButtonClick(): Promise<void> {
    await expect(this.delayedButtonLocator).toBeVisible();
  }
}
