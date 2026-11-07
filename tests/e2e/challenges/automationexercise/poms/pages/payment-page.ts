import { CookieConsentModal } from '@automationexercise/poms/components/cookie-consent';
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
    const currentUrl = this.page.url();
    const paymentUrlPattern = new RegExp(`${this.baseUrl}/payment`, 'i');
    if (!paymentUrlPattern.test(currentUrl)) {
      // SHARD-PROOF: Navigate to payment page if not already there
      // When tests are sharded, a scenario may run independently without the full
      // checkout flow from previous scenarios. This ensures we can reach the payment
      // page by completing the entire checkout flow: adding products to cart,
      // proceeding to checkout, reviewing order, and placing order.
      const { CheckoutPage } = await import('./checkout-page');
      const { CartPage } = await import('./cart-page');
      const { HomePage } = await import('./home-page');
      const checkoutPage = new CheckoutPage(this.page);
      const cartPage = new CartPage(this.page);
      const homePage = new HomePage(this.page);

      // Complete checkout flow to reach payment page
      await homePage.navigateToHomePage();
      await cartPage.ensureProductsInCart();
      await cartPage.verifyCartPage();
      await cartPage.clickProceedToCheckout();
      await checkoutPage.verifyCheckoutPage();
      await checkoutPage.reviewOrderDetails();
      await checkoutPage.enterDeliveryComments();
      await checkoutPage.clickPlaceOrder();
    }
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
    await expect(this.payButtonLocator).toBeEnabled({ timeout: 10_000 });

    // Set up navigation listener before clicking
    const navigationPromise = this.page.waitForURL(
      new RegExp(`${this.baseUrl}/payment_done`, 'i'),
      {
        timeout: 25_000,
      },
    );

    try {
      await this.payButtonLocator.click({ timeout: 10_000 });
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('intercepts')) {
        throw error;
      }
      await this.cookieConsentModal.acceptAllIfPresent();
      await this.payButtonLocator.click({ timeout: 10_000 });
    }

    // SHARD-PROOF: Wait for navigation to complete before proceeding
    // This ensures the order confirmation page has fully loaded, preventing race conditions
    // that could cause failures when tests run in parallel or sharded.
    try {
      await navigationPromise;
    } catch {
      const confirmationUrl = new RegExp(`${this.baseUrl}/payment_done`, 'i');
      if (confirmationUrl.test(this.page.url())) {
        return;
      }
      await expect(this.page).toHaveURL(confirmationUrl, { timeout: 3000 });
    }
  }
}
