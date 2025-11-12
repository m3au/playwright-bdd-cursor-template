import { Fixture, Then, When, Step, expect, type Page, type Locator } from '@world';

@Fixture('TextInputPage')
export class TextInputPage {
  private pageTitleLocator: Locator;
  private inputLocator: Locator;
  private buttonLocator: Locator;

  constructor(protected page: Page) {
    this.pageTitleLocator = this.page.getByRole('heading', { level: 3 });
    this.inputLocator = this.page.getByRole('textbox', { name: 'Set New Button Name' });
    this.buttonLocator = this.page.getByRole('button', {
      name: /Button That Should Change/i,
    });
  }

  @Then('I see the Text Input page')
  async verifyPageLoaded(): Promise<void> {
    await this.iSeeTheTextInputPage();
  }

  @Step
  private async iSeeTheTextInputPage(): Promise<void> {
    await expect(this.pageTitleLocator).toBeVisible({ timeout: 10_000 });
    await expect(this.pageTitleLocator).toHaveText('Text Input');
  }

  @When('I enter text {string} into the input field')
  async enterText(text: string): Promise<void> {
    await this.iEnterTextIntoInputField(text);
  }

  @Step
  private async iEnterTextIntoInputField(text: string): Promise<void> {
    await expect(this.inputLocator).toBeVisible({ timeout: 10_000 });
    // Use pressSequentially() to simulate physical keyboard input character by character
    await this.inputLocator.click();
    await this.inputLocator.press('Control+A');
    await this.inputLocator.pressSequentially(text);
  }

  @When('I click the button')
  async clickButton(): Promise<void> {
    await this.iClickTheButton();
  }

  @Step
  private async iClickTheButton(): Promise<void> {
    await expect(this.buttonLocator).toBeVisible({ timeout: 10_000 });
    await this.buttonLocator.click();
  }

  @Then('the button name changes to {string}')
  async verifyButtonNameChanged(expectedName: string): Promise<void> {
    await this.iVerifyButtonNameChanged(expectedName);
  }

  @Step
  private async iVerifyButtonNameChanged(expectedName: string): Promise<void> {
    // Wait for button text to update after click
    // Button text changes, so we need to get a fresh reference
    const updatedButton = this.page.getByRole('button', { name: expectedName });
    await expect(updatedButton).toBeVisible({ timeout: 5000 });
    await expect(updatedButton).toHaveText(expectedName);
  }
}
