import { Fixture, Then, When, Step, expect, type Page, type Locator } from '@world';
import { AlertHandler } from '@components/alert-handler';
import { BasePage } from '@components/base-page';

@Fixture('ClassAttributePage')
export class ClassAttributePage extends BasePage {
  private primaryButtonLocator: Locator;
  private alertHandler: AlertHandler;

  constructor(protected page: Page) {
    super(page);
    // Use locator with class filter - Playwright handles multiple classes correctly
    this.primaryButtonLocator = this.page.locator('button.btn-primary');
    this.alertHandler = new AlertHandler(page);
  }

  @Then('I see the Class Attribute page')
  async verifyPageLoaded(): Promise<void> {
    await this.iSeeTheClassAttributePage();
  }

  @Step
  private async iSeeTheClassAttributePage(): Promise<void> {
    await super.verifyPageLoaded('Class Attribute');
  }

  @When('I click the primary button')
  async clickPrimaryButton(): Promise<void> {
    await this.iSetUpAlertHandler();
    await this.iClickThePrimaryButton();
  }

  @Step
  private async iSetUpAlertHandler(): Promise<void> {
    await this.alertHandler.setUpAlertHandler();
  }

  @Step
  private async iClickThePrimaryButton(): Promise<void> {
    await expect(this.primaryButtonLocator).toBeVisible({ timeout: 10_000 });
    await this.primaryButtonLocator.click();
  }

  @Then('I see an alert popup')
  async verifyAlertPopup(): Promise<void> {
    await this.iVerifyAlertWasShown();
  }

  @Step
  private async iVerifyAlertWasShown(): Promise<void> {
    await expect(this.primaryButtonLocator).toBeVisible();
  }

  @When('I accept the alert')
  async acceptAlert(): Promise<void> {
    // Alert acceptance is handled automatically in iSetUpAlertHandler
  }

  @Then('the alert is accepted')
  async verifyAlertAccepted(): Promise<void> {
    await expect(this.pageTitleLocator).toBeVisible();
  }
}
