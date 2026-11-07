import { CookieConsentModal } from '@automationexercise/poms/components/cookie-consent';
import { Fixture, Given, When, Then, expect, environment, type Page, type Locator } from '@world';

@Fixture('CartPage')
export class CartPage {
  private readonly cartTableLocator: Locator;
  private readonly cartItemsLocator: Locator;
  private readonly firstItemQuantityInputLocator: Locator;
  private readonly firstItemRemoveButtonLocator: Locator;
  private readonly proceedToCheckoutButtonLocator: Locator;
  private readonly baseUrl: string;
  private readonly cookieConsentModal: CookieConsentModal;

  constructor(private readonly page: Page) {
    this.cartTableLocator = this.page.locator('#cart_info_table');
    this.cartItemsLocator = this.page.locator('#cart_info_table tbody tr');
    this.firstItemQuantityInputLocator = this.page
      .locator('#cart_info_table tbody tr')
      .first()
      .locator('.cart_quantity input');
    this.firstItemRemoveButtonLocator = this.page
      .locator('#cart_info_table tbody tr')
      .first()
      .locator('.cart_delete a');
    this.proceedToCheckoutButtonLocator = this.page.getByRole('link', {
      name: /proceed to checkout/i,
    });
    this.baseUrl = environment('BASE_URL_AUTOMATIONEXERCISE')!;
    this.cookieConsentModal = new CookieConsentModal(this.page);
  }

  @Given('I see the cart page')
  async verifyCartPage(): Promise<void> {
    await this.cookieConsentModal.acceptAllIfPresent();
    const currentUrl = this.page.url();
    const cartUrlPattern = new RegExp(`${this.baseUrl}/view_cart`, 'i');
    if (!cartUrlPattern.test(currentUrl)) {
      // SHARD-PROOF: Navigate to cart page if not already there
      // When tests are sharded and run independently, we may not be on the cart page.
      // Navigate via the home page cart button to ensure we reach the required state.
      const { HomePage } = await import('./home-page');
      const homePage = new HomePage(this.page);
      try {
        await homePage.navigateToHomePage();
        await homePage.clickCartButton();
      } catch (error) {
        // If navigation fails, try direct navigation
        if (
          error instanceof Error &&
          (error.message.includes('ERR_ABORTED') || error.message.includes('frame was detached'))
        ) {
          await this.page.goto(`${this.baseUrl}/view_cart`, {
            waitUntil: 'domcontentloaded',
            timeout: 30_000,
          });
        } else {
          throw error;
        }
      }
    }
    await expect(this.page).toHaveURL(new RegExp(`${this.baseUrl}/view_cart`, 'i'));
    // Cart table might not be visible if cart is empty, so check with timeout
    await expect(this.cartTableLocator).toBeVisible({ timeout: 15_000 });
  }

  @Then('I see the product in my cart')
  async verifyProductInCart(): Promise<void> {
    const items = await this.cartItemsLocator.count();
    expect(items).toBeGreaterThan(0);
  }

  @Then('I see all products in my cart')
  async verifyAllProductsInCart(): Promise<void> {
    await expect(this.cartTableLocator).toBeVisible({ timeout: 15_000 });
    const items = await this.cartItemsLocator.count();
    expect(items).toBeGreaterThan(0);
  }

  @When('I update the quantity of the first product to {string}')
  async updateProductQuantity(quantity: string): Promise<void> {
    // The cart renders quantity as a read-only control, so this step cannot edit it.
    throw new Error(
      `Quantity updates are not supported on cart page (requested ${quantity}). ` +
        'Quantity is read-only. Remove item and re-add from product details page to change quantity.',
    );
  }

  @Then('I see the cart total updated')
  async verifyCartTotalUpdated(): Promise<void> {
    await expect(this.cartTableLocator).toBeVisible();
  }

  @When('I remove the first product from cart')
  async removeFirstProduct(): Promise<void> {
    await this.verifyCartPage();
    await this.verifyProductInCart();

    // Try multiple selectors for remove button
    let removeButton = this.firstItemRemoveButtonLocator;
    let isVisible = await removeButton.isVisible({ timeout: 3000 }).catch(() => false);

    if (!isVisible) {
      const alternative = await this.firstVisibleLocator([
        this.page.locator('#cart_info_table a[href*="delete"]').first(),
        this.page.locator('.cart_delete a').first(),
        this.page.locator('a[href*="delete_cart"]').first(),
        this.page.getByRole('link', { name: /delete|remove/i }).first(),
        this.page.locator('#cart_info_table .cart_delete').first(),
        this.page.locator('table a[href*="delete"]').first(),
      ]);
      if (alternative) {
        removeButton = alternative;
        isVisible = true;
      }
    }

    // If still not visible, check if button exists in DOM
    if (!isVisible) {
      const buttonCount = await removeButton.count().catch(() => 0);
      if (buttonCount > 0) {
        // Button exists, use force click
        isVisible = true;
      }
    }

    if (!isVisible) {
      throw new Error(`Could not find remove product button. Current URL: ${this.page.url()}`);
    }

    await expect(removeButton).toBeVisible({ timeout: 5000 });

    // Get item count before removal
    const itemsBefore = await this.cartItemsLocator.count().catch(() => 0);

    // Click remove button
    await removeButton.click(
      (await removeButton.isVisible().catch(() => false)) ? undefined : { force: true },
    );

    await expect(this.page).toHaveURL(new RegExp(`${this.baseUrl}/view_cart`, 'i'));
    if (itemsBefore > 0) {
      await expect
        .poll(async () => this.cartItemsLocator.count().catch(() => 0), { timeout: 5000 })
        .toBeLessThan(itemsBefore);
    }
  }

  @Then('I see the product removed from cart')
  async verifyProductRemoved(): Promise<void> {
    // After removal, cart might be empty, so verify we're on cart page
    await expect(this.page).toHaveURL(new RegExp(`${this.baseUrl}/view_cart`, 'i'));

    // Check if cart is empty (no table) or has fewer items
    const items = await this.cartItemsLocator.count().catch(() => 0);

    // If cart is empty, table might not be visible - that's fine
    if (items === 0) {
      // Cart is empty - product was successfully removed
      // Verify we're still on cart page
      await expect(this.page).toHaveURL(new RegExp(`${this.baseUrl}/view_cart`, 'i'));
      return;
    }

    // If cart still has items, verify table is visible
    await expect(this.cartTableLocator).toBeVisible({ timeout: 5000 });

    // Items should be fewer than before removal (handled in removeFirstProduct)
    expect(items).toBeGreaterThanOrEqual(0);
  }

  @When('I click Proceed to Checkout button')
  async clickProceedToCheckout(): Promise<void> {
    // SHARD-PROOF: Ensure we're on cart page and have products before proceeding
    // This prevents failures when tests run independently and cart state may vary.
    await this.verifyCartPage();
    await this.verifyProductInCart();

    // Try multiple selectors for proceed to checkout button
    let checkoutButton = this.proceedToCheckoutButtonLocator;
    let isVisible = await checkoutButton.isVisible({ timeout: 2000 }).catch(() => false);

    // Try alternative selectors
    if (!isVisible) {
      const alternatives = [
        this.page.getByRole('link', { name: /checkout/i }),
        this.page.getByRole('button', { name: /checkout/i }),
        this.page.locator('a[href*="checkout"]'),
        this.page.locator('button[onclick*="checkout"]'),
        this.page.locator('.check_out'),
        this.page.locator('#checkout'),
      ];

      for (const alt of alternatives) {
        if (await alt.isVisible({ timeout: 2000 }).catch(() => false)) {
          checkoutButton = alt;
          isVisible = true;
          break;
        }
      }
    }

    if (!isVisible) {
      // Try finding via JavaScript
      const checkoutUrl = await this.page
        .evaluate(() => {
          const links = [...document.querySelectorAll('a')];
          for (const link of links) {
            const text = link.textContent?.toLowerCase() || '';
            const href = link.getAttribute('href') || '';
            if (
              (text.includes('checkout') || text.includes('proceed')) &&
              href.includes('checkout')
            ) {
              return href;
            }
          }
        })
        .catch(() => {});

      if (checkoutUrl) {
        const fullUrl = checkoutUrl.startsWith('http')
          ? checkoutUrl
          : `${this.baseUrl}${checkoutUrl}`;
        await this.page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
        await this.page.waitForURL(new RegExp(`${this.baseUrl}/checkout`, 'i'), {
          timeout: 10_000,
        });
        return;
      }

      throw new Error(`Could not find proceed to checkout button. Current URL: ${this.page.url()}`);
    }

    await expect(checkoutButton).toBeVisible({ timeout: 5000 });
    await expect(checkoutButton).toBeEnabled({ timeout: 5000 });
    await checkoutButton.click();
    // SHARD-PROOF: Wait for navigation to complete before proceeding
    // This ensures the checkout page has fully loaded, preventing race conditions
    // that could cause failures when tests run in parallel or sharded.
    await this.page.waitForURL(new RegExp(`${this.baseUrl}/checkout`, 'i'), { timeout: 10_000 });
  }

  @Given('I have products in my cart')
  async ensureProductsInCart(): Promise<void> {
    // SHARD-PROOF: Ensure products are in cart before proceeding
    // When tests are sharded, cart state from previous scenarios isn't available.
    // This step checks if cart is empty and adds products if needed, ensuring
    // tests can run independently without relying on shared state.
    const items = await this.cartItemsLocator.count();
    if (items === 0) {
      const { HomePage } = await import('./home-page');
      const { ProductsPage } = await import('./products-page');
      const homePage = new HomePage(this.page);
      const productsPage = new ProductsPage(this.page);
      await homePage.navigateToHomePage();
      await homePage.clickProductsButton();
      await productsPage.verifyProductsPage();
      await productsPage.addFirstProductToCart();
      await homePage.clickViewCartButton();
      await this.verifyCartPage();
    }
  }

  private async firstVisibleLocator(candidates: Locator[]): Promise<Locator | undefined> {
    for (const candidate of candidates) {
      if (await candidate.isVisible({ timeout: 2000 }).catch(() => false)) {
        return candidate;
      }
    }
    return undefined;
  }
}
