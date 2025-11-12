import { Fixture, Then, When, Step, expect, type Page, type Locator } from '@world';

@Fixture('ProgressBarPage')
export class ProgressBarPage {
  private pageTitleLocator: Locator;
  private startButtonLocator: Locator;
  private stopButtonLocator: Locator;
  private progressBarLocator: Locator;
  private resultLocator: Locator;

  constructor(protected page: Page) {
    this.pageTitleLocator = this.page.getByRole('heading', { level: 3 });
    this.startButtonLocator = this.page.getByRole('button', { name: 'Start' });
    this.stopButtonLocator = this.page.getByRole('button', { name: 'Stop' });
    // Progress bar is a div with role="progressbar" and id="progressBar"
    this.progressBarLocator = this.page.locator('#progressBar');
    this.resultLocator = this.page.locator('text=/Result:/i');
  }

  @Then('I see the Progress Bar page')
  async verifyPageLoaded(): Promise<void> {
    await this.iSeeTheProgressBarPage();
  }

  @Step
  private async iSeeTheProgressBarPage(): Promise<void> {
    await expect(this.pageTitleLocator).toBeVisible({ timeout: 10_000 });
    await expect(this.pageTitleLocator).toHaveText('Progress Bar');
  }

  @When('I click the Start button')
  async clickStartButton(): Promise<void> {
    await this.iClickTheStartButton();
  }

  @Step
  private async iClickTheStartButton(): Promise<void> {
    await expect(this.startButtonLocator).toBeVisible({ timeout: 10_000 });
    await this.startButtonLocator.click();
    // Wait for progress bar to be visible and start updating
    await expect(this.progressBarLocator).toBeVisible({ timeout: 5000 });
  }

  @When('I wait for progress bar to reach {int}%')
  async waitForProgressBar(targetPercentage: number): Promise<void> {
    await this.iWaitForProgressBarToReach(targetPercentage);
  }

  @Step
  private async iWaitForProgressBarToReach(targetPercentage: number): Promise<void> {
    // Wait for progress bar to reach target percentage
    // Progress bar is a div with role="progressbar" and id="progressBar"
    // It has aria-valuenow attribute with the numeric value
    await this.page.waitForFunction(
      (target) => {
        const progressBar = document.querySelector('#progressBar');
        if (!progressBar) return false;

        // Read from aria-valuenow attribute (contains numeric value like "75")
        const ariaValue = progressBar.getAttribute('aria-valuenow');
        if (ariaValue) {
          const value = Number.parseInt(ariaValue, 10);
          return value >= target;
        }

        // Fallback: read from text content (e.g., "75%")
        const text = progressBar.textContent || '';
        // eslint-disable-next-line sonarjs/slow-regex -- Simple regex for test data parsing, not user input
        const match = text.match(/(\d+)%/);
        if (match) {
          const value = Number.parseInt(match[1]!, 10);
          return value >= target;
        }

        return false;
      },
      targetPercentage,
      { timeout: 30_000 },
    );
  }

  @When('I click the Stop button')
  async clickStopButton(): Promise<void> {
    await this.iClickTheStopButton();
  }

  @Step
  private async iClickTheStopButton(): Promise<void> {
    await expect(this.stopButtonLocator).toBeVisible({ timeout: 10_000 });
    await this.stopButtonLocator.click();
  }

  @Then('the progress bar is stopped near {int}%')
  async verifyProgressBarStopped(targetPercentage: number): Promise<void> {
    await this.iVerifyProgressBarStoppedNear(targetPercentage);
  }

  @Step
  private async iVerifyProgressBarStoppedNear(targetPercentage: number): Promise<void> {
    // Wait a moment for the result to update
    await expect(this.resultLocator).toBeVisible({ timeout: 5000 });
    const resultText = await this.resultLocator.textContent();
    expect(resultText).toMatch(/Result:/);
    // Verify progress bar value is close to target (within reasonable range)
    // Progress bar uses aria-valuenow attribute
    const progressValue = await this.progressBarLocator.getAttribute('aria-valuenow');
    if (progressValue) {
      const value = Number.parseInt(progressValue, 10);
      const difference = Math.abs(value - targetPercentage);
      // Allow up to 5% difference
      expect(difference).toBeLessThanOrEqual(5);
    } else {
      // Fallback: check the text content if aria-valuenow is not available
      const progressText = await this.progressBarLocator.textContent();
      if (progressText) {
        // eslint-disable-next-line sonarjs/slow-regex -- Simple regex for test data parsing, not user input
        const match = progressText.match(/(\d+)%/);
        if (match) {
          const value = Number.parseInt(match[1]!, 10);
          const difference = Math.abs(value - targetPercentage);
          expect(difference).toBeLessThanOrEqual(5);
        }
      }
    }
  }
}
