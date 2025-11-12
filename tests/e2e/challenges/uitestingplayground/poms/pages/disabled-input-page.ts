import { Fixture, Then, When, Step, expect, type Page, type Locator } from '@world';

@Fixture('DisabledInputPage')
export class DisabledInputPage {
  private pageTitleLocator: Locator;
  private enableButtonLocator: Locator;
  private editFieldLocator: Locator;

  constructor(protected page: Page) {
    this.pageTitleLocator = this.page.getByRole('heading', { level: 3 });
    this.enableButtonLocator = this.page.getByRole('button', {
      name: 'Enable Edit Field with 5 seconds delay',
    });
    this.editFieldLocator = this.page.getByRole('textbox', { name: 'Edit Field' });
  }

  @Then('I see the Disabled Input page')
  async verifyPageLoaded(): Promise<void> {
    await this.iSeeTheDisabledInputPage();
  }

  @Step
  private async iSeeTheDisabledInputPage(): Promise<void> {
    await expect(this.pageTitleLocator).toBeVisible({ timeout: 10_000 });
    await expect(this.pageTitleLocator).toHaveText('Disabled Input');
  }

  @When('I click the Enable Edit Field button')
  async clickEnableButton(): Promise<void> {
    await this.iClickTheEnableButton();
  }

  @Step
  private async iClickTheEnableButton(): Promise<void> {
    await expect(this.enableButtonLocator).toBeVisible({ timeout: 10_000 });
    await this.enableButtonLocator.click();
  }

  @When('I wait for edit field to become enabled')
  async waitForEditFieldEnabled(): Promise<void> {
    await this.iWaitForEditFieldToBecomeEnabled();
  }

  @Step
  private async iWaitForEditFieldToBecomeEnabled(): Promise<void> {
    await expect(this.editFieldLocator).toBeEnabled({ timeout: 10_000 });
  }

  @When('I enter text {string} into the edit field')
  async enterText(text: string): Promise<void> {
    await this.iEnterTextIntoEditField(text);
  }

  @Step
  private async iEnterTextIntoEditField(text: string): Promise<void> {
    await expect(this.editFieldLocator).toBeEnabled({ timeout: 10_000 });
    await this.editFieldLocator.fill(text);
  }

  @Then('the text is entered successfully')
  async verifyTextEntered(): Promise<void> {
    await this.iVerifyTextEntered();
  }

  @Step
  private async iVerifyTextEntered(): Promise<void> {
    const value = await this.editFieldLocator.inputValue();
    expect(value.length).toBeGreaterThan(0);
  }
}
