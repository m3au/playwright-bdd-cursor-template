import { Fixture, Then, When, Step, expect, type Page, type Locator } from '@world';

@Fixture('VerifyTextPage')
export class VerifyTextPage {
  private pageTitleLocator: Locator;
  private welcomeTextLocator: Locator;

  constructor(protected page: Page) {
    this.pageTitleLocator = this.page.getByRole('heading', { level: 3 });
    // Text is split across multiple DOM elements, use getByText with exact match
    // The actual element has class "badge-secondary" and contains "Welcome UserName!"
    this.welcomeTextLocator = this.page
      .locator('.badge-secondary')
      .filter({ hasText: /Welcome.*!/ });
  }

  @Then('I see the Verify Text page')
  async verifyPageLoaded(): Promise<void> {
    await this.iSeeTheVerifyTextPage();
  }

  @Step
  private async iSeeTheVerifyTextPage(): Promise<void> {
    await expect(this.pageTitleLocator).toBeVisible({ timeout: 10_000 });
    await expect(this.pageTitleLocator).toHaveText('Verify Text');
  }

  @When('I find the element with Welcome text')
  async findWelcomeElement(): Promise<void> {
    await this.iFindTheWelcomeElement();
  }

  @Step
  private async iFindTheWelcomeElement(): Promise<void> {
    await expect(this.welcomeTextLocator).toBeVisible({ timeout: 10_000 });
  }

  @Then('the Welcome element is found')
  async verifyWelcomeElementFound(): Promise<void> {
    await this.iVerifyWelcomeElementFound();
  }

  @Step
  private async iVerifyWelcomeElementFound(): Promise<void> {
    await expect(this.welcomeTextLocator).toBeVisible();
    const text = await this.welcomeTextLocator.textContent();
    expect(text).toMatch(/Welcome.*!/);
  }
}
