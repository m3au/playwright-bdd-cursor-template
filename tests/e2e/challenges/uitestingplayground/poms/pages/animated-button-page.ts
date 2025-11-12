import { Fixture, Then, When, Step, expect, type Page, type Locator } from '@world';

@Fixture('AnimatedButtonPage')
export class AnimatedButtonPage {
  private pageTitleLocator: Locator;
  private startAnimationButtonLocator: Locator;
  private movingTargetButtonLocator: Locator;
  private statusLabelLocator: Locator;

  constructor(protected page: Page) {
    this.pageTitleLocator = this.page.getByRole('heading', { level: 3 });
    this.startAnimationButtonLocator = this.page.getByRole('button', { name: 'Start Animation' });
    this.movingTargetButtonLocator = this.page.getByRole('button', { name: 'Moving Target' });
    // Status label shows the class of the Moving Target button
    this.statusLabelLocator = this.page
      .locator('text=/^[^-]+$/')
      .filter({ hasText: /class|spin/i });
  }

  @Then('I see the Animated Button page')
  async verifyPageLoaded(): Promise<void> {
    await this.iSeeTheAnimatedButtonPage();
  }

  @Step
  private async iSeeTheAnimatedButtonPage(): Promise<void> {
    await expect(this.pageTitleLocator).toBeVisible({ timeout: 10_000 });
    await expect(this.pageTitleLocator).toHaveText('Animated Button');
  }

  @When('I click the Start Animation button')
  async clickStartAnimation(): Promise<void> {
    await this.iClickTheStartAnimationButton();
  }

  @Step
  private async iClickTheStartAnimationButton(): Promise<void> {
    await expect(this.startAnimationButtonLocator).toBeVisible({ timeout: 10_000 });
    await this.startAnimationButtonLocator.click();
  }

  @When('I wait for animation to complete')
  async waitForAnimationComplete(): Promise<void> {
    await this.iWaitForAnimationToComplete();
  }

  @Step
  private async iWaitForAnimationToComplete(): Promise<void> {
    // Wait for the Moving Target button to stop animating (no 'spin' class)
    // Use a polling approach to check if button has stopped spinning
    await this.page.waitForFunction(
      () => {
        const buttons = [...document.querySelectorAll('button')];
        const movingTargetButton = buttons.find(
          (button) => button.textContent?.trim() === 'Moving Target',
        );
        if (!movingTargetButton) return false;
        return !movingTargetButton.classList.contains('spin');
      },
      { timeout: 20_000 },
    );
  }

  @When('I click the Moving Target button')
  async clickMovingTarget(): Promise<void> {
    await this.iClickTheMovingTargetButton();
  }

  @Step
  private async iClickTheMovingTargetButton(): Promise<void> {
    await expect(this.movingTargetButtonLocator).toBeVisible({ timeout: 10_000 });
    await this.movingTargetButtonLocator.click();
  }

  @Then('the Moving Target button does not have spin class')
  async verifyNoSpinClass(): Promise<void> {
    await this.iVerifyNoSpinClass();
  }

  @Step
  private async iVerifyNoSpinClass(): Promise<void> {
    // Verify the button doesn't have 'spin' class
    const hasSpinClass = await this.movingTargetButtonLocator.evaluate((element) =>
      element.classList.contains('spin'),
    );
    expect(hasSpinClass).toBe(false);
  }
}
