import { BasePage } from '@components/base-page';
import { SuccessLabel } from '@components/success-label';
import { Fixture, Then, When, Step, expect, type Page, type Locator } from '@world';

@Fixture('ClientSideDelayPage')
export class ClientSideDelayPage extends BasePage {
  private clientSideButtonLocator: Locator;
  private successLabel: SuccessLabel;

  constructor(protected page: Page) {
    super(page);
    this.clientSideButtonLocator = this.page.getByRole('button', {
      name: 'Button Triggering Client Side Logic',
    });
    this.successLabel = new SuccessLabel(page);
  }

  @Then('I see the Client Side Delay page')
  async verifyPageLoaded(): Promise<void> {
    await this.iSeeTheClientSideDelayPage();
  }

  @Step
  private async iSeeTheClientSideDelayPage(): Promise<void> {
    await super.verifyPageLoaded('Client Side Delay');
  }

  @When('I click the button triggering client side logic')
  async clickClientSideButton(): Promise<void> {
    await this.iClickTheClientSideButton();
  }

  @Step
  private async iClickTheClientSideButton(): Promise<void> {
    await expect(this.clientSideButtonLocator).toBeVisible({ timeout: 10_000 });
    await this.clientSideButtonLocator.click();
  }

  @When('I wait for client side data to appear')
  async waitForClientSideData(): Promise<void> {
    await this.iWaitForClientSideDataToAppear();
  }

  @Step
  private async iWaitForClientSideDataToAppear(): Promise<void> {
    await this.successLabel.waitForLabelToAppear();
  }

  @When('I click on the client side loaded label text')
  async clickLoadedLabel(): Promise<void> {
    await this.iClickTheLoadedLabel();
  }

  @Step
  private async iClickTheLoadedLabel(): Promise<void> {
    await this.successLabel.clickLabel();
  }

  @Then('the client side label click is successful')
  async verifyLabelClick(): Promise<void> {
    await this.successLabel.verifyLabelVisible();
  }
}
