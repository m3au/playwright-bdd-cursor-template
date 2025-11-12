import { Fixture, When, Then, expect, type Page, type Locator } from '@world';

@Fixture('SignupLoginPage')
export class SignupLoginPage {
  private readonly signupNameInput: Locator;
  private readonly signupEmailInput: Locator;
  private readonly signupButton: Locator;
  private readonly loginEmailInput: Locator;
  private readonly loginPasswordInput: Locator;
  private readonly loginButton: Locator;
  private readonly signupForm: Locator;
  private readonly accountCreatedMessage: Locator;
  private readonly continueButton: Locator;

  constructor(private readonly page: Page) {
    this.signupNameInput = this.page.locator('input[data-qa="signup-name"]');
    this.signupEmailInput = this.page.locator('input[data-qa="signup-email"]');
    this.signupButton = this.page.getByRole('button', { name: /signup/i });
    this.loginEmailInput = this.page.locator('input[data-qa="login-email"]');
    this.loginPasswordInput = this.page.locator('input[data-qa="login-password"]');
    this.loginButton = this.page.getByRole('button', { name: /login/i });
    this.signupForm = this.page.locator('.signup-form');
    this.accountCreatedMessage = this.page.getByText(/account created/i);
    this.continueButton = this.page.getByRole('link', { name: /continue/i });
  }

  @Then(/^I see the signup\/login page$/)
  async verifySignupLoginPage(): Promise<void> {
    await expect(this.signupForm).toBeVisible();
    await expect(this.loginEmailInput).toBeVisible();
    await expect(this.signupNameInput).toBeVisible();
  }

  @When('I enter my name {string} and email address {string} for registration')
  async enterSignupCredentials(name: string, email: string): Promise<void> {
    await expect(this.signupNameInput).toBeVisible();
    await this.signupNameInput.fill(name);
    await expect(this.signupEmailInput).toBeVisible();
    await this.signupEmailInput.fill(email);
  }

  @When('I fill in the signup form')
  async fillSignupForm(): Promise<void> {
    // This will be implemented based on the actual form fields
    // For now, assuming name and email are already filled
    await expect(this.signupButton).toBeEnabled();
  }

  @When('I click the Signup button')
  async clickSignupButton(): Promise<void> {
    await this.signupButton.click();
  }

  @Then('I see the account created successfully message')
  async verifyAccountCreated(): Promise<void> {
    await expect(this.accountCreatedMessage).toBeVisible();
  }

  @When('I click Continue button')
  async clickContinueButton(): Promise<void> {
    await expect(this.continueButton).toBeVisible();
    await this.continueButton.click();
  }

  @When('I enter my email {string} and password {string}')
  async enterLoginCredentials(email: string, password: string): Promise<void> {
    await expect(this.loginEmailInput).toBeVisible();
    await this.loginEmailInput.fill(email);
    await expect(this.loginPasswordInput).toBeVisible();
    await this.loginPasswordInput.fill(password);
  }

  @When('I click the Login button')
  async clickLoginButton(): Promise<void> {
    await expect(this.loginButton).toBeEnabled();
    await this.loginButton.click();
  }

  @Then('I see that I am logged in')
  async verifyLoggedIn(): Promise<void> {
    // Verify we're redirected away from login page
    await expect(this.page).not.toHaveURL(/login/i);
  }

  @Then('I am redirected to the login page')
  async verifyLoginPageAfterLogout(): Promise<void> {
    // After logout, we should be redirected to login page
    await expect(this.loginEmailInput).toBeVisible({ timeout: 10_000 });
    await expect(this.loginPasswordInput).toBeVisible();
    // Verify signup form is also visible (it's the same page)
    await expect(this.signupForm).toBeVisible();
  }
}
