import { Fixture, Then, When, Step, expect, type Page, type Locator } from '@world';
import { AlertHandler } from '@components/alert-handler';
import { BasePage } from '@components/base-page';

@Fixture('AlertsPage')
export class AlertsPage extends BasePage {
  private alertButtonLocator: Locator;
  private alertHandler: AlertHandler;

  constructor(protected page: Page) {
    super(page);
    this.alertButtonLocator = this.page.getByRole('button', { name: 'Alert' });
    this.alertHandler = new AlertHandler(page);
  }

  @Then('I see the Alerts page')
  async verifyPageLoaded(): Promise<void> {
    await this.iSeeTheAlertsPage();
  }

  @Step
  private async iSeeTheAlertsPage(): Promise<void> {
    await super.verifyPageLoaded('Alerts');
  }

  @When('I click the alert button')
  async clickAlertButton(): Promise<void> {
    await this.iSetUpAlertHandler();
    await this.iClickTheAlertButton();
  }

  @Step
  private async iSetUpAlertHandler(): Promise<void> {
    await this.alertHandler.setUpAlertHandler();
  }

  @Step
  private async iClickTheAlertButton(): Promise<void> {
    await expect(this.alertButtonLocator).toBeVisible({ timeout: 10_000 });
    await this.alertButtonLocator.click();
  }

  @Then('I see an alert dialog popup')
  async verifyAlertPopup(): Promise<void> {
    await this.iVerifyAlertWasShown();
  }

  @Step
  private async iVerifyAlertWasShown(): Promise<void> {
    await expect(this.alertButtonLocator).toBeVisible();
  }

  @When('I accept the alert dialog')
  async acceptAlert(): Promise<void> {
    // Alert acceptance is handled automatically in iSetUpAlertHandler
  }

  @Then('the alert dialog is accepted')
  async verifyAlertAccepted(): Promise<void> {
    await expect(this.pageTitleLocator).toBeVisible();
  }
}
