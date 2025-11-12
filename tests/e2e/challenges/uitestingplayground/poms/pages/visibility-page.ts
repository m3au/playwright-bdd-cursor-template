import { Fixture, Then, When, Step, expect, type Page, type Locator } from '@world';

@Fixture('VisibilityPage')
export class VisibilityPage {
  private pageTitleLocator: Locator;
  private hideButtonLocator: Locator;
  private removedButtonLocator: Locator;
  private zeroWidthButtonLocator: Locator;
  private overlappedButtonLocator: Locator;
  private opacity0ButtonLocator: Locator;
  private visibilityHiddenButtonLocator: Locator;
  private displayNoneButtonLocator: Locator;
  private offscreenButtonLocator: Locator;

  constructor(protected page: Page) {
    this.pageTitleLocator = this.page.getByRole('heading', { level: 3 });
    this.hideButtonLocator = this.page.getByRole('button', { name: 'Hide' });
    this.removedButtonLocator = this.page.locator('#removedButton');
    this.zeroWidthButtonLocator = this.page.locator('#zeroWidthButton');
    this.overlappedButtonLocator = this.page.locator('#overlappedButton');
    this.opacity0ButtonLocator = this.page.locator('#transparentButton');
    this.visibilityHiddenButtonLocator = this.page.locator('#invisibleButton');
    this.displayNoneButtonLocator = this.page.locator('#notdisplayedButton');
    this.offscreenButtonLocator = this.page.locator('#offscreenButton');
  }

  @Then('I see the Visibility page')
  async verifyPageLoaded(): Promise<void> {
    await this.iSeeTheVisibilityPage();
  }

  @Step
  private async iSeeTheVisibilityPage(): Promise<void> {
    await expect(this.pageTitleLocator).toBeVisible({ timeout: 10_000 });
    await expect(this.pageTitleLocator).toHaveText('Visibility');
  }

  @When('I click the Hide button')
  async clickHideButton(): Promise<void> {
    await this.iClickTheHideButton();
  }

  @Step
  private async iClickTheHideButton(): Promise<void> {
    await expect(this.hideButtonLocator).toBeVisible({ timeout: 10_000 });
    await this.hideButtonLocator.click();
    // Wait for buttons to be hidden - verify removed button is hidden
    await expect(this.removedButtonLocator).toBeHidden({ timeout: 5000 });
  }

  @Then('the Removed button is not visible')
  async verifyRemovedButtonNotVisible(): Promise<void> {
    await expect(this.removedButtonLocator).toBeHidden();
  }

  @Then('the Zero Width button is not visible')
  async verifyZeroWidthButtonNotVisible(): Promise<void> {
    // Zero width button has width: 0px, so not visible
    const width = await this.zeroWidthButtonLocator.evaluate((element) => {
      return globalThis.getComputedStyle(element).width;
    });
    expect(width).toBe('0px');
  }

  @Then('the Overlapped button is not visible')
  async verifyOverlappedButtonNotVisible(): Promise<void> {
    // Overlapped button might be in DOM but covered by another element
    // Check if it's actually visible on screen
    const isVisible = await this.overlappedButtonLocator.isVisible().catch(() => false);
    // If visible, check if it's actually clickable (not overlapped)
    if (isVisible) {
      const boundingBox = (await this.overlappedButtonLocator.boundingBox().catch(() => {
        // Return undefined on error
      })) as Awaited<ReturnType<typeof this.overlappedButtonLocator.boundingBox>> | undefined;
      if (boundingBox) {
        // Check if element at center point is the button itself
        const elementAtPoint = await this.page.evaluate(
          ({ x, y }) => {
            const element = document.elementFromPoint(x, y);
            return element?.textContent?.trim() === 'Overlapped';
          },
          { x: boundingBox.x + boundingBox.width / 2, y: boundingBox.y + boundingBox.height / 2 },
        );
        // If element at point is not the Overlapped button, it's overlapped
        expect(elementAtPoint).toBe(false);
      }
    } else {
      expect(isVisible).toBe(false);
    }
  }

  @Then('the Opacity 0 button is not visible')
  async verifyOpacity0ButtonNotVisible(): Promise<void> {
    // Opacity 0 button has opacity: 0, so not visible to user
    const opacity = await this.opacity0ButtonLocator.evaluate((element) => {
      return globalThis.getComputedStyle(element).opacity;
    });
    expect(opacity).toBe('0');
  }

  @Then('the Visibility Hidden button is not visible')
  async verifyVisibilityHiddenButtonNotVisible(): Promise<void> {
    // Visibility hidden button has visibility: hidden, so not visible to user
    const visibility = await this.visibilityHiddenButtonLocator.evaluate((element) => {
      return globalThis.getComputedStyle(element).visibility;
    });
    expect(visibility).toBe('hidden');
  }

  @Then('the Display None button is not visible')
  async verifyDisplayNoneButtonNotVisible(): Promise<void> {
    await expect(this.displayNoneButtonLocator).toBeHidden();
  }

  @Then('the Offscreen button is not visible')
  async verifyOffscreenButtonNotVisible(): Promise<void> {
    // Offscreen button is positioned offscreen (x: -9999, y: -9999), so not visible
    const boundingBox = await this.offscreenButtonLocator.boundingBox();
    expect(boundingBox).not.toBeNull();
    if (boundingBox) {
      // Check if button is offscreen (negative coordinates or outside viewport)
      expect(boundingBox.x).toBeLessThan(0);
      expect(boundingBox.y).toBeLessThan(0);
    }
  }
}
