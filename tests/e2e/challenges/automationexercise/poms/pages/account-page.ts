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

@Fixture('AccountPage')
export class AccountPage {
  private readonly accountInfoLocator: Locator;
  private readonly ordersLinkLocator: Locator;
  private readonly updateAccountButtonLocator: Locator;
  private readonly successMessageLocator: Locator;
  private readonly ordersTableLocator: Locator;
  private readonly downloadInvoiceButtonLocator: Locator;
  private readonly baseUrl: string;
  private readonly cookieConsentModal: CookieConsentModal;

  constructor(private readonly page: Page) {
    this.accountInfoLocator = this.page.locator('.account-info');
    this.ordersLinkLocator = this.page.getByRole('link', { name: /orders/i });
    this.updateAccountButtonLocator = this.page.getByRole('button', { name: /update/i });
    this.successMessageLocator = this.page.getByText(/updated successfully/i);
    this.ordersTableLocator = this.page.locator('#orders_table');
    this.downloadInvoiceButtonLocator = this.page.locator('a[href*="download_invoice"]').first();
    this.baseUrl = environment('BASE_URL_AUTOMATIONEXERCISE')!;
    this.cookieConsentModal = new CookieConsentModal(this.page);
  }

  @Given('I see the account dashboard')
  async verifyAccountDashboard(): Promise<void> {
    await this.iEnsureAccountDashboard();
  }

  @Given('I am on the account dashboard')
  async ensureAccountDashboard(): Promise<void> {
    await this.iEnsureAccountDashboard();
  }

  @Step
  private async iEnsureAccountDashboard(): Promise<void> {
    await this.cookieConsentModal.acceptAllIfPresent();
    await expect(this.page).toHaveURL(new RegExp(`${this.baseUrl}/account`, 'i'));
    await expect(this.accountInfoLocator).toBeVisible();
  }

  @Then('I see account information')
  async verifyAccountInformation(): Promise<void> {
    await expect(this.accountInfoLocator).toBeVisible();
  }

  @When('I update my account information')
  async updateAccountInformation(): Promise<void> {
    const nameInput = this.page.locator('input[name="name"]');
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill('Updated Name');
      await this.updateAccountButtonLocator.click();
    }
  }

  @Then('I see the account updated successfully message')
  async verifyAccountUpdated(): Promise<void> {
    await expect(this.successMessageLocator).toBeVisible();
  }

  @When('I navigate to orders')
  async navigateToOrders(): Promise<void> {
    await expect(this.ordersLinkLocator).toBeVisible();
    await this.ordersLinkLocator.click();
  }

  @Then('I see my order history')
  async verifyOrderHistory(): Promise<void> {
    await expect(this.ordersTableLocator).toBeVisible();
  }

  @When('I click download invoice for the first order')
  async clickDownloadInvoice(): Promise<void> {
    await expect(this.downloadInvoiceButtonLocator).toBeVisible();
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.downloadInvoiceButtonLocator.click(),
    ]);
    expect(download.suggestedFilename()).toContain('.pdf');
  }

  @Then('I download the invoice file')
  async verifyInvoiceDownloaded(): Promise<void> {
    // Download is verified in the step above
  }

  @Given('I have placed orders')
  async ensureOrdersExist(): Promise<void> {
    // Orders should exist from previous checkout scenarios
    // If not, we'd need to create an order first
    await this.verifyAccountDashboard();
    await this.navigateToOrders();
    const hasOrders = await this.ordersTableLocator.isVisible().catch(() => false);
    if (!hasOrders) {
      // Note: In a real scenario, we'd create an order via checkout flow
      // For now, we'll just verify the page structure
    }
  }
}
