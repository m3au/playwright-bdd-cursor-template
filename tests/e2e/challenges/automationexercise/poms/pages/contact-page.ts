import { CookieConsentModal } from '@automationexercise/poms/components/cookie-consent';
import { getTestContext } from '@utils';
import { Fixture, Given, When, Then, expect, environment, type Page, type Locator } from '@world';

@Fixture('ContactPage')
export class ContactPage {
  private readonly nameInputLocator: Locator;
  private readonly emailInputLocator: Locator;
  private readonly subjectInputLocator: Locator;
  private readonly messageTextareaLocator: Locator;
  private readonly fileInputLocator: Locator;
  private readonly submitButtonLocator: Locator;
  private readonly successMessageLocator: Locator;
  private readonly baseUrl: string;
  private readonly cookieConsentModal: CookieConsentModal;

  constructor(private readonly page: Page) {
    this.nameInputLocator = this.page.locator('input[name="name"]');
    this.emailInputLocator = this.page.locator('input[name="email"]');
    this.subjectInputLocator = this.page.locator('input[name="subject"]');
    this.messageTextareaLocator = this.page.locator('textarea[name="message"]');
    this.fileInputLocator = this.page.locator('input[name="upload_file"]');
    this.submitButtonLocator = this.page.locator('input[type="submit"]');
    // Match contact form success message, excluding newsletter subscription
    this.successMessageLocator = this.page
      .getByText(/success/i)
      .filter({ hasNotText: /subscribed/i });
    this.baseUrl = environment('BASE_URL_AUTOMATIONEXERCISE')!;
    this.cookieConsentModal = new CookieConsentModal(this.page);
  }

  @Given('I see the contact page')
  async verifyContactPage(): Promise<void> {
    await this.cookieConsentModal.acceptAllIfPresent();
    const currentUrl = this.page.url();
    const contactUrlPattern = new RegExp(`${this.baseUrl}/contact_us`, 'i');
    if (!contactUrlPattern.test(currentUrl)) {
      // SHARD-PROOF: Navigate to contact page if not already there
      // When tests are sharded, a scenario may run independently without navigation
      // from previous scenarios. This ensures we can reach the contact page from
      // the home page, making the test resilient to sharding.
      const { HomePage } = await import('./home-page');
      const homePage = new HomePage(this.page);
      await homePage.navigateToHomePage();
      await homePage.clickContactUsButton();
    }
    await expect(this.page).toHaveURL(new RegExp(`${this.baseUrl}/contact_us`, 'i'));
    await expect(this.nameInputLocator).toBeVisible();
  }

  @When('I fill in the contact form with my details')
  async fillContactForm(): Promise<void> {
    const context = getTestContext();
    const user = context.automationExercise?.user;
    const name = user?.name ?? 'Test User';
    const email = user?.email ?? 'test@example.com';

    await this.nameInputLocator.fill(name);
    await this.emailInputLocator.fill(email);
    await this.subjectInputLocator.fill('Test Subject');
    await this.messageTextareaLocator.fill('This is a test message');
  }

  @When('I upload a file')
  async uploadFile(): Promise<void> {
    await this.fileInputLocator.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Test file content'),
    });
  }

  @When('I click Submit button')
  async clickSubmit(): Promise<void> {
    await expect(this.submitButtonLocator).toBeEnabled();
    let dialogMessage = '';
    this.page.once('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });
    await this.submitButtonLocator.click();

    // Store message for verification step if dialog appeared
    if (dialogMessage) {
      await this.page.evaluate((message) => {
        (
          globalThis as unknown as { _contactFormDialogMessage?: string }
        )._contactFormDialogMessage = message;
      }, dialogMessage);
    }
  }

  @Then('I see the contact form submitted successfully message')
  async verifyContactFormSubmitted(): Promise<void> {
    // SHARD-PROOF: Wait for form submission to complete and success message to appear
    // Contact form shows success in alert dialog - verify the message
    try {
      // Check if dialog message was stored from click step
      const storedMessage = await this.page
        .evaluate(
          () =>
            (globalThis as unknown as { _contactFormDialogMessage?: string })
              ._contactFormDialogMessage,
        )
        .catch(() => {});

      if (storedMessage && /success/i.test(storedMessage) && !/subscribed/i.test(storedMessage)) {
        // Clear stored message
        await this.page.evaluate(() => {
          delete (globalThis as unknown as { _contactFormDialogMessage?: string })
            ._contactFormDialogMessage;
        });
        return; // Success message verified
      }

      // If no stored message or it doesn't match, wait for dialog
      const dialog = await this.page.waitForEvent('dialog', { timeout: 10_000 });
      const message = dialog.message();

      if (/success/i.test(message) && !/subscribed/i.test(message)) {
        await dialog.accept();
        return;
      }

      await dialog.accept();

      // Fallback: check for success message on page
      const successMessage = this.page
        .getByText(/success/i)
        .filter({ hasNotText: /subscribed/i })
        .first();
      await expect(successMessage).toBeVisible({ timeout: 5000 });
    } catch {
      // No alert appeared, check for success message on page
      const successMessage = this.page
        .getByText(/success/i)
        .filter({ hasNotText: /subscribed/i })
        .first();
      await expect(successMessage).toBeVisible({ timeout: 10_000 });
    }
  }
}
