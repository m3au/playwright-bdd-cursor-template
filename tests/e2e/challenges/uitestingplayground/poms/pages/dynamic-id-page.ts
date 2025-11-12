import { Fixture, Then, When, Step, expect, type Page, type Locator } from '@world';

@Fixture('DynamicIdPage')
export class DynamicIdPage {
  private pageTitleLocator: Locator;
  private dynamicButtonLocator: Locator;

  constructor(protected page: Page) {
    this.pageTitleLocator = this.page.getByRole('heading', { level: 3 });
    // Use text-based locator instead of ID since ID is dynamic
    this.dynamicButtonLocator = this.page.getByRole('button', { name: 'Button with Dynamic ID' });
  }

  @Then('I see the Dynamic ID page')
  async verifyPageLoaded(): Promise<void> {
    await this.iSeeTheDynamicIdPage();
  }

  @Step
  private async iSeeTheDynamicIdPage(): Promise<void> {
    await expect(this.pageTitleLocator).toBeVisible({ timeout: 10_000 });
    await expect(this.pageTitleLocator).toHaveText('Dynamic ID');
  }

  @When('I click the button with dynamic ID')
  async clickDynamicButton(): Promise<void> {
    await this.iClickTheDynamicButton();
  }

  @Step
  private async iClickTheDynamicButton(): Promise<void> {
    await expect(this.dynamicButtonLocator).toBeVisible({ timeout: 10_000 });
    await this.dynamicButtonLocator.click();
  }

  @Then('the button click is successful')
  async verifyButtonClick(): Promise<void> {
    await expect(this.dynamicButtonLocator).toBeVisible();
  }
}
