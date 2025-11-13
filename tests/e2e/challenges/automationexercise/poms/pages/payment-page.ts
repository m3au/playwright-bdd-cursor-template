import {
  Fixture,
  Given,
  When,
  Then,
  Step,
  expect,
  environment,
  type Page,
  type Locator,
} from '@world';
import { CookieConsentModal } from '@automationexercise/poms/components/cookie-consent';

@Fixture('PaymentPage')
export class PaymentPage {
  private readonly nameOnCardInputLocator: Locator;
  private readonly cardNumberInputLocator: Locator;
  private readonly cvcInputLocator: Locator;
  private readonly expiryMonthInputLocator: Locator;
  private readonly expiryYearInputLocator: Locator;
  private readonly payButtonLocator: Locator;
  private readonly baseUrl: string;
  private readonly cookieConsentModal: CookieConsentModal;

  constructor(private readonly page: Page) {
    this.nameOnCardInputLocator = this.page.locator('input[name="name_on_card"]');
    this.cardNumberInputLocator = this.page.locator('input[name="card_number"]');
    this.cvcInputLocator = this.page.locator('input[name="cvc"]');
    this.expiryMonthInputLocator = this.page.locator('input[name="expiry_month"]');
    this.expiryYearInputLocator = this.page.locator('input[name="expiry_year"]');
    this.payButtonLocator = this.page.locator('#submit');
    this.baseUrl = environment('BASE_URL_AUTOMATIONEXERCISE')!;
    this.cookieConsentModal = new CookieConsentModal(this.page);
  }

  @Given('I am on the payment page')
  async ensureOnPaymentPage(): Promise<void> {
    await this.iVerifyPaymentPage();
  }

  @Then('I see the payment page')
  async verifyPaymentPageVisible(): Promise<void> {
    await this.iVerifyPaymentPage();
  }

  @Step
  private async iVerifyPaymentPage(): Promise<void> {
    await this.cookieConsentModal.acceptAllIfPresent();
    await expect(this.page).toHaveURL(new RegExp(`${this.baseUrl}/payment`, 'i'));
    await expect(this.nameOnCardInputLocator).toBeVisible();
  }

  @When('I enter payment details')
  async enterPaymentDetails(): Promise<void> {
    await this.nameOnCardInputLocator.fill('Test User');
    await this.cardNumberInputLocator.fill('1234567890123456');
    await this.cvcInputLocator.fill('123');
    await this.expiryMonthInputLocator.fill('12');
    await this.expiryYearInputLocator.fill('2025');
  }

  @When('I click Pay and Confirm Order button')
  async clickPayAndConfirm(): Promise<void> {
    await expect(this.payButtonLocator).toBeEnabled();
    await this.payButtonLocator.click();
  }
}
