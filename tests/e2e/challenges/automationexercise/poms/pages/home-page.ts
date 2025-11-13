import {
  Fixture,
  Given,
  Then,
  When,
  Step,
  expect,
  environment,
  type Page,
  type Locator,
} from '@world';
import { CookieConsentModal } from '@automationexercise/poms/components/cookie-consent';
import { registerAutomationExerciseUser } from '@automationexercise/utils/api-client';
import {
  generateAutomationExerciseUser,
  type AutomationExerciseUser,
} from '@automationexercise/utils/user-data';
import { getTestContext, setTestContext } from '@utils';

import { SignupLoginPage } from '@automationexercise/poms/pages/signup-login-page';

type AutomationExerciseState = {
  user: AutomationExerciseUser;
  userRegistered: boolean;
};

@Fixture('HomePage')
export class HomePage {
  private readonly signupLoginButtonLocator: Locator;
  private readonly logoutButtonLocator: Locator;
  private readonly loggedInIndicatorLocator: Locator;
  private readonly baseUrl: string;
  private readonly cookieConsentModal: CookieConsentModal;

  constructor(private readonly page: Page) {
    this.signupLoginButtonLocator = this.page.getByRole('link', { name: /signup|login/i });
    this.logoutButtonLocator = this.page.getByRole('link', { name: /logout/i });
    this.loggedInIndicatorLocator = this.page.getByText(/logged in as/i);
    this.baseUrl = environment('BASE_URL_AUTOMATIONEXERCISE')!;
    this.cookieConsentModal = new CookieConsentModal(this.page);
  }

  @Given('I navigate to the AutomationExercise home page')
  async navigateToHomePage(): Promise<void> {
    await this.page.goto(this.baseUrl);
    await expect(this.page).toHaveURL(this.buildBaseUrlPattern());
    await this.cookieConsentModal.acceptAllIfPresent();
  }

  @When(/^I click on Signup\/Login button$/)
  async clickSignupLoginButton(): Promise<void> {
    await this.cookieConsentModal.acceptAllIfPresent();
    await expect(this.signupLoginButtonLocator).toBeVisible();
    await this.signupLoginButtonLocator.click();
  }

  @When('I click the Logout button')
  async clickLogoutButton(): Promise<void> {
    await expect(this.logoutButtonLocator).toBeVisible();
    await this.logoutButtonLocator.click();
  }

  @Given('I am logged in to AutomationExercise')
  async ensureLoggedIn(): Promise<void> {
    const { user } = await this.ensureAutomationExerciseState();
    await this.navigateToHomePage();

    const isAlreadyLoggedIn = await this.loggedInIndicatorLocator.isVisible().catch(() => false);
    if (isAlreadyLoggedIn) {
      await this.verifyLoggedIn(user.name);
      return;
    }

    const signupLoginPage = new SignupLoginPage(this.page);
    await this.clickSignupLoginButton();
    await signupLoginPage.fillLoginFormWith(user);
    await signupLoginPage.clickLoginButton();
    await this.verifyLoggedIn(user.name);
  }

  @Step
  async verifyLoggedIn(username: string): Promise<void> {
    await this.ensureHomeContext();
    await expect(this.loggedInIndicatorLocator).toBeVisible();
    await expect(this.loggedInIndicatorLocator).toContainText(new RegExp(username, 'i'));
  }

  @Then('I see that I am logged in as the generated user')
  async verifyLoggedInAsGeneratedUser(): Promise<void> {
    const state = await this.ensureAutomationExerciseState();
    await this.verifyLoggedIn(state.user.name);
  }

  private buildBaseUrlPattern(): RegExp {
    const escapedUrl = this.baseUrl.replaceAll(/[.*+?^${}()|[\]\\]/gu, String.raw`\$&`);
    return new RegExp(`^${escapedUrl}(/.*)?$`, 'i');
  }

  private async ensureHomeContext(): Promise<void> {
    const pattern = this.buildBaseUrlPattern();
    const currentUrl = this.page.url();
    const isAdPage =
      currentUrl.includes('#google_vignette') || currentUrl.includes('googleads.g.doubleclick');

    if (isAdPage || !pattern.test(currentUrl)) {
      await this.page.goto(this.baseUrl, { waitUntil: 'domcontentloaded' });
    }

    await expect(this.page).toHaveURL(this.buildBaseUrlPattern());
    await this.cookieConsentModal.acceptAllIfPresent();
  }

  private async ensureAutomationExerciseState(): Promise<AutomationExerciseState> {
    const context = getTestContext();
    const automationExercise = context.automationExercise ?? {};
    let { user, userRegistered = false } = automationExercise;

    if (!user) {
      user = generateAutomationExerciseUser();
      this.updateAutomationExerciseContext({ user });
    }

    if (!userRegistered) {
      await registerAutomationExerciseUser(user);
      userRegistered = true;
      this.updateAutomationExerciseContext({ user, userRegistered });
    }

    return { user, userRegistered };
  }

  private updateAutomationExerciseContext(update: Partial<AutomationExerciseState>): void {
    const context = getTestContext();
    const automationExercise = {
      ...context.automationExercise,
      ...update,
    };
    setTestContext({ automationExercise });
  }
}
