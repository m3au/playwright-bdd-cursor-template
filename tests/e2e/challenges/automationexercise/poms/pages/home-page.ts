import { Fixture, Given, When, Step, expect, environment, type Page, type Locator } from '@world';

@Fixture('HomePage')
export class HomePage {
  private readonly signupLoginButton: Locator;
  private readonly logoutButton: Locator;
  private readonly loggedInIndicator: Locator;

  constructor(private readonly page: Page) {
    this.signupLoginButton = this.page.getByRole('link', { name: /signup|login/i });
    this.logoutButton = this.page.getByRole('link', { name: /logout/i });
    this.loggedInIndicator = this.page.getByText(/logged in as/i);
  }

  @Given('I navigate to the AutomationExercise home page')
  async navigateToHomePage(): Promise<void> {
    const baseUrl = environment('BASE_URL_AUTOMATIONEXERCISE')!;
    await this.page.goto(baseUrl);
    await expect(this.page).toHaveURL(new RegExp(baseUrl.replace(/https?:\/\//, '')));
  }

  @When(/^I click on Signup\/Login button$/)
  async clickSignupLoginButton(): Promise<void> {
    await expect(this.signupLoginButton).toBeVisible();
    await this.signupLoginButton.click();
  }

  @When('I click the Logout button')
  async clickLogoutButton(): Promise<void> {
    await expect(this.logoutButton).toBeVisible();
    await this.logoutButton.click();
  }

  @Given('I am logged in to AutomationExercise')
  async ensureLoggedIn(): Promise<void> {
    // Check if already logged in
    const isLoggedIn = await this.loggedInIndicator.isVisible().catch(() => false);
    if (!isLoggedIn) {
      // Navigate to login and perform login
      // This is a placeholder - actual implementation will depend on test data setup
      await this.navigateToHomePage();
      await this.clickSignupLoginButton();
    }
  }

  @Step
  async verifyLoggedIn(username: string): Promise<void> {
    await expect(this.loggedInIndicator).toBeVisible();
    await expect(this.loggedInIndicator).toContainText(username);
  }
}
