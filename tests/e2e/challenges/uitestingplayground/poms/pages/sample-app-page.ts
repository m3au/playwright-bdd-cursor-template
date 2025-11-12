import { Fixture, Then, When, Step, expect, type Page, type Locator } from '@world';

@Fixture('SampleAppPage')
export class SampleAppPage {
  private pageTitleLocator: Locator;
  private userNameInputLocator: Locator;
  private passwordInputLocator: Locator;
  private loginButtonLocator: Locator;
  private statusMessageLocator: Locator;

  constructor(protected page: Page) {
    this.pageTitleLocator = this.page.getByRole('heading', { level: 3 });
    this.userNameInputLocator = this.page.getByRole('textbox', { name: 'User Name' });
    // Password field doesn't have accessible name, use type selector
    this.passwordInputLocator = this.page.locator('input[type="password"]');
    this.loginButtonLocator = this.page.getByRole('button', { name: 'Log In' });
    // Status message appears after login - text changes from "User logged out." to "Welcome, testuser!"
    this.statusMessageLocator = this.page.getByText(/Welcome|User logged/i);
  }

  @Then('I see the Sample App page')
  async verifyPageLoaded(): Promise<void> {
    await this.iSeeTheSampleAppPage();
  }

  @Step
  private async iSeeTheSampleAppPage(): Promise<void> {
    await expect(this.pageTitleLocator).toBeVisible({ timeout: 10_000 });
    await expect(this.pageTitleLocator).toHaveText('Sample App');
  }

  @When('I enter username {string} and password {string}')
  async enterCredentials(username: string, password: string): Promise<void> {
    await this.iEnterUsername(username);
    await this.iEnterPassword(password);
  }

  @Step
  private async iEnterUsername(username: string): Promise<void> {
    await expect(this.userNameInputLocator).toBeVisible({ timeout: 10_000 });
    await this.userNameInputLocator.fill(username);
  }

  @Step
  private async iEnterPassword(password: string): Promise<void> {
    await expect(this.passwordInputLocator).toBeVisible({ timeout: 10_000 });
    await this.passwordInputLocator.fill(password);
  }

  @When('I click the Log In button')
  async clickLogin(): Promise<void> {
    await this.iClickTheLoginButton();
  }

  @Step
  private async iClickTheLoginButton(): Promise<void> {
    await expect(this.loginButtonLocator).toBeVisible({ timeout: 10_000 });
    await this.loginButtonLocator.click();
  }

  @Then('I see the success message')
  async verifySuccessMessage(): Promise<void> {
    await this.iSeeTheSuccessMessage();
  }

  @Step
  private async iSeeTheSuccessMessage(): Promise<void> {
    await expect(this.statusMessageLocator).toBeVisible({ timeout: 10_000 });
    const message = await this.statusMessageLocator.textContent();
    expect(message).toMatch(/Welcome/i);
  }
}
