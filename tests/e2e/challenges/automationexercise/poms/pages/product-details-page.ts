import { Fixture, Given, Then, expect, environment, type Page, type Locator } from '@world';
import { CookieConsentModal } from '@automationexercise/poms/components/cookie-consent';

@Fixture('ProductDetailsPage')
export class ProductDetailsPage {
  private readonly productNameLocator: Locator;
  private readonly productPriceLocator: Locator;
  private readonly productDescriptionLocator: Locator;
  private readonly addToCartButtonLocator: Locator;
  private readonly baseUrl: string;
  private readonly cookieConsentModal: CookieConsentModal;

  constructor(private readonly page: Page) {
    this.productNameLocator = this.page.locator('.product-information h2');
    this.productPriceLocator = this.page.locator('.product-information span span');
    this.productDescriptionLocator = this.page.locator('.product-information p').first();
    this.addToCartButtonLocator = this.page.locator('button.cart');
    this.baseUrl = environment('BASE_URL_AUTOMATIONEXERCISE')!;
    this.cookieConsentModal = new CookieConsentModal(this.page);
  }

  @Given('I see the product details page')
  async verifyProductDetailsPage(): Promise<void> {
    await this.cookieConsentModal.acceptAllIfPresent();
    await expect(this.page).toHaveURL(new RegExp(`${this.baseUrl}/product_details`, 'i'));
    await expect(this.productNameLocator).toBeVisible();
  }

  @Then('I see product information including name, price, and description')
  async verifyProductInformation(): Promise<void> {
    await expect(this.productNameLocator).toBeVisible();
    await expect(this.productPriceLocator).toBeVisible();
    await expect(this.productDescriptionLocator).toBeVisible();
  }
}
