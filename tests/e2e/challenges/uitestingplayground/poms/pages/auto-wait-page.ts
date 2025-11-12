import { Fixture, Then, When, Step, expect, type Page, type Locator } from '@world';

@Fixture('AutoWaitPage')
export class AutoWaitPage {
  private pageTitleLocator: Locator;
  private apply3sButtonLocator: Locator;
  private playgroundButtonLocator: Locator;

  constructor(protected page: Page) {
    this.pageTitleLocator = this.page.getByRole('heading', { level: 3 });
    this.apply3sButtonLocator = this.page.getByRole('button', { name: 'Apply 3s' });
    // Button in playground section
    this.playgroundButtonLocator = this.page
      .locator('h4:has-text("Playground")')
      .locator('..')
      .getByRole('button', { name: 'Button' });
  }

  @Then('I see the Auto Wait page')
  async verifyPageLoaded(): Promise<void> {
    await this.iSeeTheAutoWaitPage();
  }

  @Step
  private async iSeeTheAutoWaitPage(): Promise<void> {
    await expect(this.pageTitleLocator).toBeVisible({ timeout: 10_000 });
    await expect(this.pageTitleLocator).toHaveText('Auto Wait');
  }

  @When('I click the Apply 3s button')
  async clickApply3sButton(): Promise<void> {
    await this.iClickTheApply3sButton();
  }

  @Step
  private async iClickTheApply3sButton(): Promise<void> {
    await expect(this.apply3sButtonLocator).toBeVisible({ timeout: 10_000 });
    await this.apply3sButtonLocator.click();
  }

  @When('I wait for element to become interactable')
  async waitForElementInteractable(): Promise<void> {
    await this.iWaitForElementToBecomeInteractable();
  }

  @Step
  private async iWaitForElementToBecomeInteractable(): Promise<void> {
    await expect(this.playgroundButtonLocator).toBeVisible({ timeout: 10_000 });
    await expect(this.playgroundButtonLocator).toBeEnabled({ timeout: 10_000 });
  }

  @When('I click the Button element')
  async clickPlaygroundButton(): Promise<void> {
    await this.iClickThePlaygroundButton();
  }

  @Step
  private async iClickThePlaygroundButton(): Promise<void> {
    await this.playgroundButtonLocator.click({ timeout: 10_000 });
  }

  @Then('the playground button click is successful')
  async verifyButtonClick(): Promise<void> {
    await expect(this.playgroundButtonLocator).toBeVisible();
  }
}
