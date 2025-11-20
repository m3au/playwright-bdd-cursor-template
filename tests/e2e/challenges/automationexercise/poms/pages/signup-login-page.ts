import { CookieConsentModal } from '@automationexercise/poms/components/cookie-consent';
import { registerAutomationExerciseUser } from '@automationexercise/utils/api-client';
import {
  createUniqueEmail,
  generateAutomationExerciseUser,
  type AutomationExerciseUser,
} from '@automationexercise/utils/user-data';
import { getTestContext, setTestContext } from '@utils';
import { Fixture, Given, When, Then, Step, expect, type Page, type Locator } from '@world';

@Fixture('SignupLoginPage')
export class SignupLoginPage {
  private readonly signupNameInputLocator: Locator;
  private readonly signupEmailInputLocator: Locator;
  private readonly signupButtonLocator: Locator;
  private readonly loginEmailInputLocator: Locator;
  private readonly loginPasswordInputLocator: Locator;
  private readonly loginButtonLocator: Locator;
  private readonly signupFormLocator: Locator;
  private readonly accountCreatedMessageLocator: Locator;
  private readonly continueButtonLocator: Locator;
  private readonly titleMrRadioLocator: Locator;
  private readonly titleMrsRadioLocator: Locator;
  private readonly passwordInputLocator: Locator;
  private readonly daysSelectLocator: Locator;
  private readonly monthsSelectLocator: Locator;
  private readonly yearsSelectLocator: Locator;
  private readonly newsletterCheckboxLocator: Locator;
  private readonly offersCheckboxLocator: Locator;
  private readonly firstNameInputLocator: Locator;
  private readonly lastNameInputLocator: Locator;
  private readonly companyInputLocator: Locator;
  private readonly address1InputLocator: Locator;
  private readonly address2InputLocator: Locator;
  private readonly countrySelectLocator: Locator;
  private readonly stateInputLocator: Locator;
  private readonly cityInputLocator: Locator;
  private readonly zipcodeInputLocator: Locator;
  private readonly mobileNumberInputLocator: Locator;
  private readonly createAccountButtonLocator: Locator;
  private readonly cookieConsentModal: CookieConsentModal;

  constructor(private readonly page: Page) {
    this.signupNameInputLocator = this.page.locator('input[data-qa="signup-name"]');
    this.signupEmailInputLocator = this.page.locator('input[data-qa="signup-email"]');
    this.signupButtonLocator = this.page.locator('button[data-qa="signup-button"]');
    this.loginEmailInputLocator = this.page.locator('input[data-qa="login-email"]');
    this.loginPasswordInputLocator = this.page.locator('input[data-qa="login-password"]');
    this.loginButtonLocator = this.page.locator('button[data-qa="login-button"]');
    this.signupFormLocator = this.page.locator('.signup-form');
    this.accountCreatedMessageLocator = this.page.locator('[data-qa="account-created"]');
    this.continueButtonLocator = this.page.locator('[data-qa="continue-button"]');
    this.titleMrRadioLocator = this.page.locator('input#id_gender1');
    this.titleMrsRadioLocator = this.page.locator('input#id_gender2');
    this.passwordInputLocator = this.page.locator('input[data-qa="password"]');
    this.daysSelectLocator = this.page.locator('select[data-qa="days"]');
    this.monthsSelectLocator = this.page.locator('select[data-qa="months"]');
    this.yearsSelectLocator = this.page.locator('select[data-qa="years"]');
    this.newsletterCheckboxLocator = this.page.locator('input#newsletter');
    this.offersCheckboxLocator = this.page.locator('input#optin');
    this.firstNameInputLocator = this.page.locator('input[data-qa="first_name"]');
    this.lastNameInputLocator = this.page.locator('input[data-qa="last_name"]');
    this.companyInputLocator = this.page.locator('input[data-qa="company"]');
    this.address1InputLocator = this.page.locator('input[data-qa="address"]');
    this.address2InputLocator = this.page.locator('input[data-qa="address2"]');
    this.countrySelectLocator = this.page.locator('select[data-qa="country"]');
    this.stateInputLocator = this.page.locator('input[data-qa="state"]');
    this.cityInputLocator = this.page.locator('input[data-qa="city"]');
    this.zipcodeInputLocator = this.page.locator('input[data-qa="zipcode"]');
    this.mobileNumberInputLocator = this.page.locator('input[data-qa="mobile_number"]');
    this.createAccountButtonLocator = this.page.locator('button[data-qa="create-account"]');
    this.cookieConsentModal = new CookieConsentModal(this.page);
  }

  @Then(/^I see the signup\/login page$/)
  async verifySignupLoginPage(): Promise<void> {
    await this.cookieConsentModal.acceptAllIfPresent();
    await expect(this.signupFormLocator).toBeVisible();
    await expect(this.loginEmailInputLocator).toBeVisible();
    await expect(this.signupNameInputLocator).toBeVisible();
  }

  @Given('I have AutomationExercise user details')
  async ensureAutomationExerciseUserDetails(): Promise<void> {
    const context = getTestContext();
    if (context.automationExercise?.user) {
      return;
    }

    const user = generateAutomationExerciseUser();
    this.updateAutomationExerciseContext({ user, userRegistered: false });
  }

  @When('I enter my signup name and unique email address')
  async enterSignupNameAndEmail(): Promise<void> {
    const user = this.getAutomationExerciseUser();

    // Ensure we always use a fresh email address to avoid duplicates.
    const uniqueEmail = createUniqueEmail(user.email);
    const updatedUser: AutomationExerciseUser = {
      ...user,
      email: uniqueEmail,
    };
    this.updateAutomationExerciseContext({ user: updatedUser });

    await expect(this.signupNameInputLocator).toBeVisible();
    await this.signupNameInputLocator.fill(updatedUser.name);
    await expect(this.signupEmailInputLocator).toBeVisible();
    await this.signupEmailInputLocator.fill(updatedUser.email);
  }

  @When('I click the Signup button')
  async clickSignupButton(): Promise<void> {
    await expect(this.signupButtonLocator).toBeEnabled();
    await this.signupButtonLocator.click();
  }

  @When('I fill in the signup form with my details')
  async fillSignupFormWithDetails(): Promise<void> {
    const user = this.getAutomationExerciseUser();
    await expect(this.passwordInputLocator).toBeVisible({ timeout: 10_000 });
    await this.fillAccountInformation(user);
  }

  @When('I click the Create Account button')
  async clickCreateAccountButton(): Promise<void> {
    await expect(this.createAccountButtonLocator).toBeEnabled();
    await this.createAccountButtonLocator.click();
  }

  @Then('I see the account created successfully message')
  async verifyAccountCreated(): Promise<void> {
    await expect(this.accountCreatedMessageLocator).toBeVisible();
    const user = this.getAutomationExerciseUser();
    this.updateAutomationExerciseContext({ user, userRegistered: true });
  }

  @When('I click Continue button')
  async clickContinueButton(): Promise<void> {
    await expect(this.continueButtonLocator).toBeVisible();
    await this.continueButtonLocator.click();
  }

  @Given('I have a registered AutomationExercise user')
  async ensureRegisteredAutomationExerciseUser(): Promise<void> {
    await this.ensureAutomationExerciseUserDetails();
    const context = getTestContext();
    if (context.automationExercise?.userRegistered) {
      return;
    }

    const user = this.getAutomationExerciseUser();
    await registerAutomationExerciseUser(user);
    this.updateAutomationExerciseContext({ user, userRegistered: true });
  }

  @When('I enter my registered email and password')
  async enterRegisteredLoginCredentials(): Promise<void> {
    const user = this.getAutomationExerciseUser();
    await this.fillLoginFormWith(user);
  }

  @When('I click the Login button')
  async clickLoginButton(): Promise<void> {
    await expect(this.loginButtonLocator).toBeEnabled();
    await this.loginButtonLocator.click();
  }

  @Then('I am redirected to the login page')
  async verifyLoginPageAfterLogout(): Promise<void> {
    // After logout, we should be redirected to login page
    await expect(this.loginEmailInputLocator).toBeVisible({ timeout: 10_000 });
    await expect(this.loginPasswordInputLocator).toBeVisible();
    // Verify signup form is also visible (it's the same page)
    await expect(this.signupFormLocator).toBeVisible();
  }

  @Step
  async fillLoginFormWith(user: AutomationExerciseUser): Promise<void> {
    await expect(this.loginEmailInputLocator).toBeVisible();
    await this.loginEmailInputLocator.fill(user.email);
    await expect(this.loginPasswordInputLocator).toBeVisible();
    await this.loginPasswordInputLocator.fill(user.password);
  }

  @Step
  private async fillAccountInformation(user: AutomationExerciseUser): Promise<void> {
    await (user.title === 'Mr'
      ? this.titleMrRadioLocator.check()
      : this.titleMrsRadioLocator.check());

    await this.passwordInputLocator.fill(user.password);
    await this.daysSelectLocator.selectOption(user.birthDay);
    await this.monthsSelectLocator.selectOption(user.birthMonth);
    await this.yearsSelectLocator.selectOption(user.birthYear);

    await this.newsletterCheckboxLocator.setChecked(user.subscribeNewsletter);
    await this.offersCheckboxLocator.setChecked(user.receiveSpecialOffers);

    await this.firstNameInputLocator.fill(user.firstName);
    await this.lastNameInputLocator.fill(user.lastName);
    if (user.company) {
      await this.companyInputLocator.fill(user.company);
    }
    await this.address1InputLocator.fill(user.address1);
    if (user.address2) {
      await this.address2InputLocator.fill(user.address2);
    }
    await this.countrySelectLocator.selectOption({ label: user.country });
    await this.stateInputLocator.fill(user.state);
    await this.cityInputLocator.fill(user.city);
    await this.zipcodeInputLocator.fill(user.zipcode);
    await this.mobileNumberInputLocator.fill(user.mobileNumber);
  }

  private getAutomationExerciseUser(): AutomationExerciseUser {
    const context = getTestContext();
    const user = context.automationExercise?.user;
    if (!user) {
      const generatedUser = generateAutomationExerciseUser();
      this.updateAutomationExerciseContext({ user: generatedUser, userRegistered: false });
      return generatedUser;
    }
    return user;
  }

  private updateAutomationExerciseContext(update: {
    user?: AutomationExerciseUser;
    userRegistered?: boolean;
  }): void {
    const context = getTestContext();
    const automationExercise = {
      ...context.automationExercise,
      ...update,
    };
    setTestContext({ automationExercise });
  }
}
