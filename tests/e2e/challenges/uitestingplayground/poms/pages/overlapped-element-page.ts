import { Fixture, Then, When, Step, expect, type Page, type Locator } from '@world';

@Fixture('OverlappedElementPage')
export class OverlappedElementPage {
  private pageTitleLocator: Locator;
  private nameInputLocator: Locator;

  constructor(protected page: Page) {
    this.pageTitleLocator = this.page.getByRole('heading', { level: 3 });
    // Input has id="name" and placeholder="Name", not name attribute
    this.nameInputLocator = this.page.locator('#name');
  }

  @Then('I see the Overlapped Element page')
  async verifyPageLoaded(): Promise<void> {
    await this.iSeeTheOverlappedElementPage();
  }

  @Step
  private async iSeeTheOverlappedElementPage(): Promise<void> {
    await expect(this.pageTitleLocator).toBeVisible({ timeout: 10_000 });
    await expect(this.pageTitleLocator).toHaveText('Overlapped Element');
  }

  @When('I scroll the Name input field into view')
  async scrollNameInputIntoView(): Promise<void> {
    await this.iScrollTheNameInputIntoView();
  }

  @Step
  private async iScrollTheNameInputIntoView(): Promise<void> {
    await this.nameInputLocator.scrollIntoViewIfNeeded();
    await expect(this.nameInputLocator).toBeVisible({ timeout: 5000 });
  }

  @When('I enter text {string} into the Name input field')
  async enterText(text: string): Promise<void> {
    await this.iEnterTextIntoNameInput(text);
  }

  @Step
  private async iEnterTextIntoNameInput(text: string): Promise<void> {
    await expect(this.nameInputLocator).toBeVisible({ timeout: 10_000 });
    await this.nameInputLocator.click();
    await this.nameInputLocator.fill(text);
  }

  @Then('the text {string} is entered correctly')
  async verifyTextEntered(expectedText: string): Promise<void> {
    await this.iVerifyTextEntered(expectedText);
  }

  @Step
  private async iVerifyTextEntered(expectedText: string): Promise<void> {
    const value = this.nameInputLocator;
    await expect(value).toHaveValue(expectedText);
  }
}
