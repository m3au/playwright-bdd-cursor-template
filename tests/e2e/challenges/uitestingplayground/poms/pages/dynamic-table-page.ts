import { Fixture, Then, When, Step, expect, type Page, type Locator } from '@world';

@Fixture('DynamicTablePage')
export class DynamicTablePage {
  private pageTitleLocator: Locator;
  private tableLocator: Locator;
  private chromeCpuLabelLocator: Locator;

  constructor(protected page: Page) {
    this.pageTitleLocator = this.page.getByRole('heading', { level: 3 });
    this.tableLocator = this.page.getByRole('table', { name: 'Tasks' });
    // Yellow label showing "Chrome CPU: X%"
    this.chromeCpuLabelLocator = this.page.getByText(/Chrome CPU:/i);
  }

  @Then('I see the Dynamic Table page')
  async verifyPageLoaded(): Promise<void> {
    await this.iSeeTheDynamicTablePage();
  }

  @Step
  private async iSeeTheDynamicTablePage(): Promise<void> {
    await expect(this.pageTitleLocator).toBeVisible({ timeout: 10_000 });
    await expect(this.pageTitleLocator).toHaveText('Dynamic Table');
  }

  @When('I get the CPU value for Chrome from the table')
  async getChromeCpuValue(): Promise<void> {
    await this.iGetTheChromeCpuValue();
  }

  @Step
  private async iGetTheChromeCpuValue(): Promise<void> {
    // Table uses divs with ARIA attributes, not real table elements
    // Find the Chrome row and get CPU value
    const chromeRow = this.tableLocator.getByRole('row').filter({ hasText: /Chrome/i });
    await expect(chromeRow).toBeVisible({ timeout: 10_000 });

    // Find CPU column header to get its index
    const headerRow = this.tableLocator.getByRole('row').first();
    const headers = headerRow.getByRole('columnheader');
    const headerCount = await headers.count();

    let cpuColumnIndex = -1;
    for (let index = 0; index < headerCount; index++) {
      const header = headers.nth(index);
      const headerText = await header.textContent();
      if (headerText?.trim().toLowerCase().includes('cpu')) {
        cpuColumnIndex = index;
        break;
      }
    }

    if (cpuColumnIndex >= 0) {
      // Get all cells in the Chrome row (excluding the header row)
      const chromeCells = chromeRow.getByRole('cell');
      const cpuCell = chromeCells.nth(cpuColumnIndex);
      const cpuValue = await cpuCell.textContent();
      // Store the value for comparison
      await this.page.evaluate((value) => {
        (globalThis as unknown as { chromeCpuValue: string }).chromeCpuValue = value || '';
      }, cpuValue);
    } else {
      throw new Error('Could not find CPU column in table');
    }
  }

  @Then('the CPU value matches the value in the yellow label')
  async verifyCpuValueMatches(): Promise<void> {
    await this.iVerifyCpuValueMatches();
  }

  @Step
  private async iVerifyCpuValueMatches(): Promise<void> {
    // Get value from yellow label
    await expect(this.chromeCpuLabelLocator).toBeVisible({ timeout: 10_000 });
    const labelText = await this.chromeCpuLabelLocator.textContent();
    const labelMatch = labelText?.match(/Chrome CPU:\s*([\d.]+%)/i);

    // Get value from table (stored in globalThis object)
    const tableCpuValue = await this.page.evaluate(() => {
      return (globalThis as unknown as { chromeCpuValue?: string }).chromeCpuValue || '';
    });

    if (labelMatch && labelMatch[1] && tableCpuValue) {
      const labelValue = labelMatch[1];
      expect(tableCpuValue.trim()).toBe(labelValue.trim());
    } else {
      throw new Error('Could not extract CPU values for comparison');
    }
  }
}
