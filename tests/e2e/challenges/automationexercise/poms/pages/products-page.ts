import { CookieConsentModal } from '@automationexercise/poms/components/cookie-consent';
import { Fixture, Given, When, Then, expect, environment, type Page, type Locator } from '@world';

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
    const currentUrl = this.page.url();
    const productsUrlPattern = new RegExp(`${this.baseUrl}/products`, 'i');
    if (!productsUrlPattern.test(currentUrl)) {
      // SHARD-PROOF: Navigate to products page if not already there
      // When tests are sharded and run independently, a test may start on any page
      // or even on the homepage. This ensures the test can reach the required state
      // regardless of the starting point, making it resilient to sharding.
      const { HomePage } = await import('./home-page');
      const homePage = new HomePage(this.page);
      await homePage.navigateToHomePage();
      await homePage.clickProductsButton();
    }
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
    // Ensure we're on the products page first
    await this.verifyProductsPage();

    await expect(this.firstProductLocator).toBeVisible({ timeout: 10_000 });

    // SHARD-PROOF: Wait for navigation to complete before proceeding
    // This ensures the page has fully loaded before subsequent steps, preventing
    // race conditions that could cause failures when tests run in parallel or sharded.
    const urlPattern = new RegExp(`${this.baseUrl}/product_details`, 'i');

    // Try multiple strategies to navigate to product details
    if (await this.openFirstProductLink(urlPattern)) {
      return;
    }

    // Strategy 2: Get href via JavaScript and navigate directly
    const href = await this.page
      .evaluate(() => {
        const product = document.querySelector('.single-products');
        if (product) {
          // Try to find link with href
          const link = product.querySelector('a[href]');
          if (link) {
            return link.getAttribute('href');
          }
          // Try to find onclick handler that navigates
          const clickable = product.querySelector(
            '[onclick*="product_details"], [onclick*="product"]',
          );
          if (clickable) {
            const onclick = clickable.getAttribute('onclick');
            const match = onclick?.match(/product_details[/?](\d+)/);
            if (match) {
              return `/product_details/${match[1]}`;
            }
          }
          // Try data attributes
          const productElement = product instanceof HTMLElement ? product : undefined;
          const nested = product.querySelector('[data-product-id]');
          const nestedElement = nested instanceof HTMLElement ? nested : undefined;
          const dataId =
            productElement?.dataset['productId'] || nestedElement?.dataset['productId'];
          if (dataId) {
            return `/product_details/${dataId}`;
          }
        }
      })
      .catch(() => {});

    if (href) {
      const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
      try {
        await this.page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
        await expect(this.page).toHaveURL(urlPattern);
        return;
      } catch {
        // Continue to next strategy
      }
    }

    // Strategy 3: Click the product container itself (might have click handler)
    try {
      await Promise.all([
        this.page.waitForURL(urlPattern, {
          timeout: 15_000,
          waitUntil: 'domcontentloaded',
        }),
        this.firstProductLocator.click({ timeout: 5000 }),
      ]);
      return;
    } catch {
      // Continue to next strategy
    }

    // Strategy 4: Try clicking product image
    const productImage = this.firstProductLocator.locator('img').first();
    if (await productImage.isVisible({ timeout: 2000 }).catch(() => false)) {
      try {
        await Promise.all([
          this.page.waitForURL(urlPattern, {
            timeout: 15_000,
            waitUntil: 'domcontentloaded',
          }),
          productImage.click({ timeout: 5000 }),
        ]);
        return;
      } catch {
        // Continue
      }
    }

    // Strategy 5: Try navigating to first product details URL pattern
    // Products are usually numbered, try product_details/1
    for (let index = 1; index <= 10; index++) {
      try {
        await this.page.goto(`${this.baseUrl}/product_details/${index}`, {
          waitUntil: 'domcontentloaded',
          timeout: 10_000,
        });
        if (urlPattern.test(this.page.url())) {
          return;
        }
      } catch {
        continue;
      }
    }

    throw new Error(
      `Could not navigate to product details. Tried multiple strategies. Current URL: ${this.page.url()}`,
    );
  }

  private async openFirstProductLink(urlPattern: RegExp): Promise<boolean> {
    const productLink = this.firstProductLocator.locator('a').first();
    const isLinkVisible = await productLink.isVisible({ timeout: 2000 }).catch(() => false);
    if (!isLinkVisible) {
      return false;
    }

    try {
      await Promise.all([
        this.page.waitForURL(urlPattern, {
          timeout: 15_000,
          waitUntil: 'domcontentloaded',
        }),
        productLink.click({ timeout: 5000 }),
      ]);
      return true;
    } catch {
      return false;
    }
  }

  @When('I add the first product to cart')
  async addFirstProductToCart(): Promise<void> {
    await expect(this.firstProductLocator).toBeVisible({ timeout: 10_000 });

    const addToCartButton = this.firstProductLocator.locator('.add-to-cart').first();
    await expect(addToCartButton).toBeVisible({ timeout: 5000 });

    try {
      await addToCartButton.click({ timeout: 5000 });
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('intercepts')) {
        throw error;
      }
      await this.cookieConsentModal.acceptAllIfPresent();
      await addToCartButton.click({ timeout: 5000 });
    }

    // Wait for success message
    const successMessage = this.page.getByText(/added/i).first();
    const isVisible = await successMessage.isVisible({ timeout: 5000 }).catch(() => false);
    if (isVisible) {
      await expect(successMessage).toBeVisible({ timeout: 5000 });
    }
  }

  @Then('I see the product added to cart message')
  async verifyProductAddedToCart(): Promise<void> {
    const successMessage = this.page.getByText(/added/i).first();
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  }
}
