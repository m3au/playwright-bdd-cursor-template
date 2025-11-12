import { Fixture, Then, When, Step, expect, type Page, type Locator } from '@world';

@Fixture('NonBreakingSpacePage')
export class NonBreakingSpacePage {
  private pageTitleLocator: Locator;
  private myButtonLocator: Locator;

  constructor(protected page: Page) {
    this.pageTitleLocator = this.page.getByRole('heading', { level: 3 });
    // Playwright's getByRole normalizes whitespace including non-breaking spaces
    this.myButtonLocator = this.page.getByRole('button', { name: 'My Button' });
  }

  @Then('I see the Non-Breaking Space page')
  async verifyPageLoaded(): Promise<void> {
    await this.iSeeTheNonBreakingSpacePage();
  }

  @Step
  private async iSeeTheNonBreakingSpacePage(): Promise<void> {
    await expect(this.pageTitleLocator).toBeVisible({ timeout: 10_000 });
    await expect(this.pageTitleLocator).toHaveText('Non-Breaking Space');
  }

  @When('I click the My Button')
  async clickMyButton(): Promise<void> {
    await this.iClickTheMyButton();
  }

  @Step
  private async iClickTheMyButton(): Promise<void> {
    await expect(this.myButtonLocator).toBeVisible({ timeout: 10_000 });
    await this.myButtonLocator.click();
  }

  @Then('the My Button click is successful')
  async verifyButtonClick(): Promise<void> {
    await expect(this.myButtonLocator).toBeVisible();
  }
}
