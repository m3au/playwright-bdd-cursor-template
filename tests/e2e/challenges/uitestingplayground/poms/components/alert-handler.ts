import { Step, type Page } from '@world';

/**
 * Alert Handler Component
 * Provides reusable alert/dialog handling functionality
 */
export class AlertHandler {
  constructor(protected page: Page) {}

  /**
   * Set up a one-time alert handler that accepts the dialog
   * Call this before clicking a button that triggers an alert
   */
  @Step
  async setUpAlertHandler(): Promise<void> {
    this.page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
  }

  /**
   * Set up a one-time alert handler that dismisses the dialog
   * Call this before clicking a button that triggers an alert
   */
  @Step
  async setUpDismissHandler(): Promise<void> {
    this.page.once('dialog', async (dialog) => {
      await dialog.dismiss();
    });
  }

  /**
   * Set up a one-time prompt handler that accepts with custom text
   * Call this before clicking a button that triggers a prompt
   */
  @Step
  async setUpPromptHandler(promptText: string): Promise<void> {
    this.page.once('dialog', async (dialog) => {
      await dialog.accept(promptText);
    });
  }
}
