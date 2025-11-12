import { Fixture, Then, When, Step, expect, type Page, type Locator } from '@world';
import { SuccessLabel } from '@components/success-label';
import { BasePage } from '@components/base-page';

@Fixture('AjaxDataPage')
export class AjaxDataPage extends BasePage {
  private ajaxButtonLocator: Locator;
  private successLabel: SuccessLabel;

  constructor(protected page: Page) {
    super(page);
    this.ajaxButtonLocator = this.page.getByRole('button', {
      name: 'Button Triggering AJAX Request',
    });
    this.successLabel = new SuccessLabel(page);
  }

  @Then('I see the AJAX Data page')
  async verifyPageLoaded(): Promise<void> {
    await this.iSeeTheAjaxDataPage();
  }

  @Step
  private async iSeeTheAjaxDataPage(): Promise<void> {
    await super.verifyPageLoaded('AJAX Data');
  }

  @When('I click the button triggering AJAX request')
  async clickAjaxButton(): Promise<void> {
    await this.iClickTheAjaxButton();
  }

  @Step
  private async iClickTheAjaxButton(): Promise<void> {
    await expect(this.ajaxButtonLocator).toBeVisible({ timeout: 10_000 });
    await this.ajaxButtonLocator.click();
  }

  @When('I wait for AJAX data to appear')
  async waitForAjaxData(): Promise<void> {
    await this.iWaitForAjaxDataToAppear();
  }

  @Step
  private async iWaitForAjaxDataToAppear(): Promise<void> {
    await this.successLabel.waitForLabelToAppear();
  }

  @When('I click on the AJAX loaded label text')
  async clickLoadedLabel(): Promise<void> {
    await this.iClickTheLoadedLabel();
  }

  @Step
  private async iClickTheLoadedLabel(): Promise<void> {
    await this.successLabel.clickLabel();
  }

  @Then('the AJAX label click is successful')
  async verifyLabelClick(): Promise<void> {
    await this.successLabel.verifyLabelVisible();
  }
}
