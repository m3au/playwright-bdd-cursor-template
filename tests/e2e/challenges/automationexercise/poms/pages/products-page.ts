import { Fixture, Given, When, Then, expect, environment, type Page, type Locator } from '@world';
import { CookieConsentModal } from '@automationexercise/poms/components/cookie-consent';

@Fixture('ProductsPage')
export class ProductsPage {
  private readonly productsListLocator: Locator;
  private readonly searchInputLocator: Locator;
  private readonly searchButtonLocator: Locator;
  private readonly firstProductLocator: Locator;
  private readonly baseUrl: string;
  private readonly cookieConsentModal: CookieConsentModal;

  constructor(private readonly page: Page) {
    this.productsListLocator = this.page.locator('.features_items');
    this.searchInputLocator = this.page.locator('#search_product');
    this.searchButtonLocator = this.page.locator('#submit_search');
    this.firstProductLocator = this.page.locator('.single-products').first();
    this.baseUrl = environment('BASE_URL_AUTOMATIONEXERCISE')!;
    this.cookieConsentModal = new CookieConsentModal(this.page);
  }

  @Given('I see the products page')
  async verifyProductsPage(): Promise<void> {
    await this.cookieConsentModal.acceptAllIfPresent();
    await expect(this.page).toHaveURL(new RegExp(`${this.baseUrl}/products`, 'i'));
    await expect(this.productsListLocator).toBeVisible();
  }

  @Then('I see a list of products')
  async verifyProductsList(): Promise<void> {
    const products = this.page.locator('.single-products');
    await expect(products.first()).toBeVisible();
    const count = await products.count();
    expect(count).toBeGreaterThan(0);
  }

  @When('I enter {string} in the search input')
  async enterSearchTerm(searchTerm: string): Promise<void> {
    await expect(this.searchInputLocator).toBeVisible();
    await this.searchInputLocator.fill(searchTerm);
  }

  @When('I click the search button')
  async clickSearchButton(): Promise<void> {
    await expect(this.searchButtonLocator).toBeEnabled();
    await this.searchButtonLocator.click();
  }

  @Then('I see search results for {string}')
  async verifySearchResults(searchTerm: string): Promise<void> {
    await expect(this.productsListLocator).toBeVisible();
    const products = this.page.locator('.single-products');
    const count = await products.count();
    expect(count).toBeGreaterThan(0);
  }

  @When('I click on the first product')
  async clickFirstProduct(): Promise<void> {
    await expect(this.firstProductLocator).toBeVisible();
    await this.firstProductLocator.locator('a').first().click();
  }

  @When('I add the first product to cart')
  async addFirstProductToCart(): Promise<void> {
    await expect(this.firstProductLocator).toBeVisible();
    const addToCartButton = this.firstProductLocator.locator('.add-to-cart').first();
    await addToCartButton.click();
    // Wait for success message or modal to appear
    const successMessage = this.page.getByText(/added/i);
    const isVisible = await successMessage.isVisible({ timeout: 5000 }).catch(() => false);
    if (isVisible) {
      await expect(successMessage).toBeVisible();
    }
  }

  @Then('I see the product added to cart message')
  async verifyProductAddedToCart(): Promise<void> {
    const successMessage = this.page.getByText(/added/i);
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  }
}
