import { Fixture, Then, When, Step, expect, type Page, type Locator } from '@world';

@Fixture('ScrollbarsPage')
export class ScrollbarsPage {
  private pageTitleLocator: Locator;
  private hidingButtonLocator: Locator;

  constructor(protected page: Page) {
    this.pageTitleLocator = this.page.getByRole('heading', { level: 3 });
    this.hidingButtonLocator = this.page.getByRole('button', { name: 'Hiding Button' });
  }

  @Then('I see the Scrollbars page')
  async verifyPageLoaded(): Promise<void> {
    await this.iSeeTheScrollbarsPage();
  }

  @Step
  private async iSeeTheScrollbarsPage(): Promise<void> {
    await expect(this.pageTitleLocator).toBeVisible({ timeout: 10_000 });
    await expect(this.pageTitleLocator).toHaveText('Scrollbars');
  }

  @When('I scroll the hiding button into view')
  async scrollButtonIntoView(): Promise<void> {
    await this.iScrollTheHidingButtonIntoView();
  }

  @Step
  private async iScrollTheHidingButtonIntoView(): Promise<void> {
    await this.hidingButtonLocator.scrollIntoViewIfNeeded();
    await expect(this.hidingButtonLocator).toBeVisible({ timeout: 5000 });
  }

  @When('I click the hiding button')
  async clickHidingButton(): Promise<void> {
    await this.iClickTheHidingButton();
  }

  @Step
  private async iClickTheHidingButton(): Promise<void> {
    await expect(this.hidingButtonLocator).toBeVisible({ timeout: 10_000 });
    await this.hidingButtonLocator.click();
  }

  @Then('the hiding button click is successful')
  async verifyButtonClick(): Promise<void> {
    await expect(this.hidingButtonLocator).toBeVisible();
  }
}
