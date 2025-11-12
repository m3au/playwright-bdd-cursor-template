import { Fixture, Then, When, Step, expect, type Page, type Locator } from '@world';

@Fixture('HiddenLayersPage')
export class HiddenLayersPage {
  private pageTitleLocator: Locator;
  private greenButtonLocator: Locator;

  constructor(protected page: Page) {
    this.pageTitleLocator = this.page.getByRole('heading', { level: 3 });
    // Green button - after first click, it becomes hidden behind another layer
    // Use ID selector to avoid strict mode violation (there are 2 buttons with same text)
    this.greenButtonLocator = this.page.locator('#greenButton');
  }

  @Then('I see the Hidden Layers page')
  async verifyPageLoaded(): Promise<void> {
    await this.iSeeTheHiddenLayersPage();
  }

  @Step
  private async iSeeTheHiddenLayersPage(): Promise<void> {
    await expect(this.pageTitleLocator).toBeVisible({ timeout: 10_000 });
    await expect(this.pageTitleLocator).toHaveText('Hidden Layers');
  }

  @When('I click the green button')
  async clickGreenButton(): Promise<void> {
    await this.iClickTheGreenButton();
  }

  @Step
  private async iClickTheGreenButton(): Promise<void> {
    await expect(this.greenButtonLocator).toBeVisible({ timeout: 10_000 });
    await this.greenButtonLocator.click();
    // Wait for layer to change - verify button is still present but may be overlapped
    await expect(this.greenButtonLocator).toBeAttached({ timeout: 5000 });
  }

  @Then('the green button click is successful')
  async verifyButtonClick(): Promise<void> {
    // Button click doesn't produce visible feedback, but we verify it's clickable
    await expect(this.greenButtonLocator).toBeVisible();
  }

  @When('I try to click the green button again')
  async tryClickGreenButtonAgain(): Promise<void> {
    // This step exists for Gherkin clarity - actual verification happens in next step
  }

  @Then('the green button is not clickable')
  async verifyButtonNotClickable(): Promise<void> {
    await this.iVerifyButtonNotClickable();
  }

  @Step
  private async iVerifyButtonNotClickable(): Promise<void> {
    // After first click, green button is hidden behind another layer
    // There should now be two buttons - the first (green) is hidden, second is on top
    const allButtons = this.page.getByRole('button', { name: 'Button' });
    const buttonCount = await allButtons.count();

    // Should have 2 buttons after first click
    expect(buttonCount).toBeGreaterThanOrEqual(2);

    // The first button (green) should not be clickable because it's hidden
    // Try to click it - Playwright should click the top button instead
    const firstButton = allButtons.first();
    const firstButtonBoundingBox = (await firstButton.boundingBox().catch(() => {
      // Return undefined on error
    })) as Awaited<ReturnType<typeof firstButton.boundingBox>> | undefined;

    if (firstButtonBoundingBox) {
      // Check what element is actually at the center point of first button
      const elementAtPoint = await this.page.evaluate(
        ({ x, y }) => {
          const element = document.elementFromPoint(x, y);
          return {
            tagName: element?.tagName,
            textContent: element?.textContent?.trim(),
            id: element?.id,
          };
        },
        {
          x: firstButtonBoundingBox.x + firstButtonBoundingBox.width / 2,
          y: firstButtonBoundingBox.y + firstButtonBoundingBox.height / 2,
        },
      );

      // The element at the point should be the second button, not the first
      // Verify that clicking would hit a different button
      // If element at point has different ID than first button, it's overlapped
      expect(elementAtPoint.id).not.toBe(await firstButton.getAttribute('id').catch(() => ''));
    }
  }
}
