import { Fixture, Then, When, Step, expect, type Page, type Locator } from '@world';

@Fixture('MouseOverPage')
export class MouseOverPage {
  private pageTitleLocator: Locator;
  private firstLinkLocator: Locator;
  private secondLinkLocator: Locator;
  private clickCountLocator: Locator;

  constructor(protected page: Page) {
    this.pageTitleLocator = this.page.getByRole('heading', { level: 3 });
    // Links are in playground section - find by text content
    // First link says "Click me", second says "Link Button"
    // Filter out navigation links (they have href attributes pointing to other pages)
    this.firstLinkLocator = this.page
      .getByText('Click me')
      .filter({ hasNotText: /github|apache/i });
    this.secondLinkLocator = this.page
      .getByText('Link Button')
      .filter({ hasNotText: /github|apache/i });
    // Click count is shown in paragraphs with text like "The link above clicked 0 times."
    // Use getByText with regex instead of CSS selector
    this.clickCountLocator = this.page.getByText(/clicked.*times/i);
  }

  @Then('I see the Mouse Over page')
  async verifyPageLoaded(): Promise<void> {
    await this.iSeeTheMouseOverPage();
  }

  @Step
  private async iSeeTheMouseOverPage(): Promise<void> {
    await expect(this.pageTitleLocator).toBeVisible({ timeout: 10_000 });
    await expect(this.pageTitleLocator).toHaveText('Mouse Over');
  }

  @When('I hover over the first link')
  async hoverOverFirstLink(): Promise<void> {
    await this.iHoverOverFirstLink();
  }

  @Step
  private async iHoverOverFirstLink(): Promise<void> {
    // Hover over the first link - this will replace it in the DOM
    // Find link by text "Click me" - it's in a paragraph that contains "click count"
    const firstLink = this.page.getByText('Click me').first();
    await expect(firstLink).toBeVisible({ timeout: 10_000 });
    await firstLink.hover();
    // Wait for DOM replacement - verify link text changes or becomes clickable
    await expect(firstLink).toBeEnabled({ timeout: 1000 });
  }

  @When('I click the first link')
  async clickFirstLink(): Promise<void> {
    await this.iClickTheFirstLink();
  }

  @Step
  private async iClickTheFirstLink(): Promise<void> {
    // After hover, the link is replaced and text changes
    // Always find by position in playground section
    const playgroundSection = this.page.locator('h4:has-text("Playground")').locator('..');
    const allLinks = playgroundSection.locator('a');
    const linkCount = await allLinks.count();
    // Find first link that's not navigation (check by href)
    let firstLink: Locator | undefined;
    for (let index = 0; index < linkCount; index++) {
      const link = allLinks.nth(index);
      const href = (await link.getAttribute('href')) || '';
      if (
        !href.includes('github') &&
        !href.includes('apache') &&
        !href.includes('home') &&
        !href.includes('resources')
      ) {
        firstLink = link;
        break;
      }
    }
    if (!firstLink) {
      throw new Error('Could not find first playground link');
    }
    await expect(firstLink).toBeVisible({ timeout: 10_000 });
    await firstLink.click();
  }

  @When('I hover over the second link')
  async hoverOverSecondLink(): Promise<void> {
    await this.iHoverOverSecondLink();
  }

  @Step
  private async iHoverOverSecondLink(): Promise<void> {
    // Hover over the second link - this will replace it in the DOM
    // Find link by text "Link Button" - it's in the second paragraph that contains "click count"
    const secondLink = this.page.getByText('Link Button').first();
    await expect(secondLink).toBeVisible({ timeout: 10_000 });
    await secondLink.hover();
    // Wait for DOM replacement - verify link text changes or becomes clickable
    await expect(secondLink).toBeEnabled({ timeout: 1000 });
  }

  @When('I click the second link')
  async clickSecondLink(): Promise<void> {
    await this.iClickTheSecondLink();
  }

  @Step
  private async iClickTheSecondLink(): Promise<void> {
    // After hover, the link is replaced and text changes
    // Always find by position in playground section
    const playgroundSection = this.page.locator('h4:has-text("Playground")').locator('..');
    const allLinks = playgroundSection.locator('a');
    const linkCount = await allLinks.count();
    // Find second link that's not navigation (check by href)
    let linkIndex = 0;
    let secondLink: Locator | undefined;
    for (let index = 0; index < linkCount; index++) {
      const link = allLinks.nth(index);
      const href = (await link.getAttribute('href')) || '';
      if (
        !href.includes('github') &&
        !href.includes('apache') &&
        !href.includes('home') &&
        !href.includes('resources')
      ) {
        if (linkIndex === 1) {
          secondLink = link;
          break;
        }
        linkIndex++;
      }
    }
    if (!secondLink) {
      throw new Error('Could not find second playground link');
    }
    await expect(secondLink).toBeVisible({ timeout: 10_000 });
    await secondLink.click();
  }

  @Then('the click count increases by {int}')
  async verifyClickCountIncreased(expectedIncrease: number): Promise<void> {
    await this.iVerifyClickCountIncreased(expectedIncrease);
  }

  @Step
  private async iVerifyClickCountIncreased(expectedIncrease: number): Promise<void> {
    // Wait for click count to update
    // Get all paragraphs containing "clicked X times"
    const countElements = this.page.getByText(/clicked.*times/i);
    await expect(countElements.first()).toBeVisible({ timeout: 5000 });

    // Wait for counts to update after clicks - verify text contains a number
    await expect(countElements.first()).toContainText(/\d+/, { timeout: 2000 });

    // Get all matching elements
    const allCountTexts = await countElements.allTextContents();
    expect(allCountTexts.length).toBeGreaterThanOrEqual(2);

    // Parse counts from text
    const firstMatch = allCountTexts[0]?.match(/(\d+)/);
    const secondMatch = allCountTexts[1]?.match(/(\d+)/);
    if (firstMatch && secondMatch) {
      const firstValue = Number.parseInt(firstMatch[1]!, 10);
      const secondValue = Number.parseInt(secondMatch[1]!, 10);
      // Each link should have been clicked once, so each counter should show 1
      // Total increase is 2 (1+1), so verify both counters show 1
      expect(firstValue).toBe(1);
      expect(secondValue).toBe(1);
      // Total increase across both counters
      const totalIncrease = firstValue + secondValue;
      expect(totalIncrease).toBe(expectedIncrease);
    } else {
      throw new Error('Could not parse click count from text');
    }
  }
}
