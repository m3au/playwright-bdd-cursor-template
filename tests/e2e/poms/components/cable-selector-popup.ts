import { Fixture, Step, expect, type Locator, type Page } from '@world';
import {
  calculateTargetPageIndex,
  getRandomIndex,
  hasClass,
  isValidTextItem,
  navigateToPageIndex,
  waitForAjaxResponseFromHost,
  waitForDOMStabilization,
} from '@utils';
import { getEnvironment } from '@data/config';

@Fixture('CableSelectorPopup')
export class CableSelectorPopup {
  private popupLocator: Locator;
  private cableTypeMenuLocator: Locator;
  private cableTypeItemLocator: Locator;
  private connectorMenuLocator: Locator;
  private connectorPaginationItemLocator: Locator;
  private connectorItemLocator: Locator;
  private rightArrowLocator: Locator;
  private leftArrowLocator: Locator;

  constructor(protected page: Page) {
    this.popupLocator = this.page.getByRole('dialog');
    this.cableTypeMenuLocator = this.popupLocator.locator('[class*="plugmodal__category"]');
    this.cableTypeItemLocator = this.cableTypeMenuLocator.locator('.items .item');
    this.connectorMenuLocator = this.popupLocator.locator('[class*="plugmodal__plugs"]');
    this.connectorPaginationItemLocator = this.connectorMenuLocator.locator('.items .item');
    this.connectorItemLocator = this.connectorMenuLocator.locator('.cg-plugItem');
    this.rightArrowLocator = this.popupLocator.locator('[class*="arrow"]:has-text("right")');
    this.leftArrowLocator = this.popupLocator.locator('[class*="arrow"]:has-text("left")');
  }

  @Step
  async iSeeTheCableSelectorPopup(): Promise<void> {
    await expect(this.popupLocator).toBeVisible();
  }

  @Step
  async iSeeTheCableSelectorPopupIsOpen(): Promise<boolean> {
    return await this.popupLocator.isVisible();
  }

  /**
   * Selects a cable type from the popup menu.
   * When selecting an end cable type, waits for backend AJAX response and frontend DOM updates
   * because the server returns available plugs (not inactive types), and the frontend infers
   * inactive types by comparing categories. This inference adds the 'inactive' class dynamically.
   *
   * @param type - Cable type to select ('random' for random selection)
   * @param isEndSide - Whether this is an end cable selection (requires waiting for DOM updates)
   */
  @Step
  async iSelectCableOfType(type: string, isEndSide = false): Promise<string> {
    if (isEndSide) {
      await this.iWaitForBackendEvent();
      await this.iWaitForFrontendUpdate();
    }

    return type.toLowerCase() === 'random'
      ? await this.iSelectRandomCableType()
      : await this.iSelectSpecificCableType(type);
  }

  @Step
  async iSelectConnector(connector?: string): Promise<string> {
    await this.iEnsureConnectorMenuIsVisible();
    return await this.iClickConnector(connector);
  }

  private async iSelectRandomCableType(): Promise<string> {
    const availableTypes = await this.iGetAvailableCableTypes();

    if (availableTypes.length === 0) throw new Error('No cable types available to select');

    const randomIndex = getRandomIndex(availableTypes.length);
    const selectedType = availableTypes[randomIndex];

    if (!selectedType) throw new Error('Failed to select cable type: locator is undefined');

    // Verify the element is still active before clicking (state may have changed)
    const isInactive = await this.iIsCableTypeInactive(selectedType);
    if (isInactive) {
      throw new Error('Selected cable type became inactive before clicking');
    }

    const typeText = await selectedType.textContent();
    await selectedType.click();
    return typeText?.trim() || 'unknown';
  }

  private async iSelectSpecificCableType(type: string): Promise<string> {
    const count = await this.cableTypeItemLocator.count();
    let typeLocator: Locator | undefined;

    for (let index = 0; index < count; index++) {
      const item = this.cableTypeItemLocator.nth(index);
      const text = await item.textContent();
      const isInactive = await this.iIsCableTypeInactive(item);

      if (text && text.toLowerCase().includes(type.toLowerCase()) && !isInactive) {
        typeLocator = item;
        break;
      }
    }

    if (!typeLocator) {
      const allItems = await this.cableTypeItemLocator.all();
      for (const item of allItems) {
        const text = await item.textContent();
        if (text && text.toLowerCase().includes(type.toLowerCase())) {
          const isInactive = await this.iIsCableTypeInactive(item);
          if (isInactive) {
            throw new Error(`Cable type "${type}" is inactive and cannot be selected`);
          }
        }
      }
      throw new Error(`Cable type "${type}" not found or is inactive`);
    }

    const typeText = await typeLocator.textContent();
    await typeLocator.click();
    return typeText?.trim() || type;
  }

  private async iGetAvailableCableTypes(): Promise<Locator[]> {
    const availableTypes: Locator[] = [];
    const count = await this.cableTypeItemLocator.count();

    for (let index = 0; index < count; index++) {
      const item = this.cableTypeItemLocator.nth(index);
      const text = await item.textContent();
      const isVisible = await item.isVisible().catch(() => false);
      const isInactive = await this.iIsCableTypeInactive(item);

      if (isValidTextItem(text, isVisible, ['all cable types']) && !isInactive) {
        availableTypes.push(item);
      }
    }

    return availableTypes;
  }

  /**
   * Checks if a cable type is marked as inactive.
   * The frontend adds the 'inactive' class to cable types whose categories aren't present
   * in the server's AJAX response, preventing selection of incompatible cable types.
   */
  private async iIsCableTypeInactive(locator: Locator): Promise<boolean> {
    return hasClass(locator, 'inactive');
  }

  /**
   * Waits for the AJAX response that contains available plugs with categories.
   * The frontend uses this data to determine which end cable types should be marked inactive.
   */
  @Step
  private async iWaitForBackendEvent(): Promise<void> {
    await expect(this.cableTypeItemLocator.first()).toBeVisible({ timeout: 5000 });

    try {
      const { environment } = getEnvironment();
      const response = await waitForAjaxResponseFromHost(
        this.page,
        environment.baseUrl,
        'cableguy_ajax.html',
        { timeout: 5000, method: 'GET' },
      );

      if (response) {
        const json = await response.json();
        if (!this.iHasValidPlugsStructure(json))
          throw new Error('Backend response does not contain expected plugs data structure');
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Timeout')) {
        await expect(this.cableTypeItemLocator.first()).toBeVisible({ timeout: 1000 });
        return;
      }
      throw error;
    }
  }

  /**
   * Waits for the frontend to finish updating DOM after AJAX response.
   * The frontend adds 'inactive' class to cable types whose categories aren't in the server response.
   * We wait until all cable types are processed (either marked inactive or confirmed active)
   * to ensure the DOM has stabilized before attempting selection.
   */
  @Step
  private async iWaitForFrontendUpdate(): Promise<void> {
    await this.page
      .waitForFunction(
        () => {
          const cableTypeItems = document.querySelectorAll(
            '[class*="plugmodal__category"] .items .item',
          );
          if (cableTypeItems.length === 0) return false;

          const minExpectedElements = 5;
          if (cableTypeItems.length < minExpectedElements) return false;

          let processedCount = 0;
          let hasActiveElements = false;

          for (const item of cableTypeItems) {
            const hasInactive = item.classList.contains('inactive');
            if (hasInactive) {
              processedCount++;
            } else {
              // Active element - verify it has content
              const hasContent = item.textContent && item.textContent.trim().length > 0;
              if (hasContent) {
                hasActiveElements = true;
                processedCount++;
              }
            }
          }

          return processedCount === cableTypeItems.length && hasActiveElements;
        },
        { timeout: 5000 },
      )
      .catch(() => {
        // Update may have happened differently
      });

    await waitForDOMStabilization(this.page);
  }

  private iHasValidPlugsStructure(json: unknown): boolean {
    return (
      typeof json === 'object' &&
      json !== null &&
      'plugs' in json &&
      typeof json.plugs === 'object' &&
      json.plugs !== null &&
      'plugs' in json.plugs &&
      Array.isArray(json.plugs.plugs)
    );
  }

  @Step
  private async iEnsureConnectorMenuIsVisible(): Promise<void> {
    const connectorMenuVisible = await this.connectorMenuLocator.isVisible().catch(() => false);
    const hasCableTypes = await this.iHasCableTypes();

    if (hasCableTypes && !connectorMenuVisible) await this.iSelectCableOfType('random');

    await expect(this.connectorMenuLocator).toBeVisible();
    await expect(this.connectorItemLocator.first()).toBeVisible({ timeout: 5000 });
  }

  private async iHasCableTypes(): Promise<boolean> {
    const cableTypeCount = await this.cableTypeItemLocator.count();
    return cableTypeCount > 0 && (await this.cableTypeItemLocator.first().isVisible());
  }

  private async iClickConnector(connector?: string): Promise<string> {
    const connectorCount = await this.connectorItemLocator.count();

    if (connectorCount === 0) throw new Error('No connectors available to select');

    const isRandom = !connector || connector.toLowerCase() === 'random';
    return await (isRandom
      ? this.iClickRandomConnector(connectorCount)
      : this.iClickSpecificConnector(connector));
  }

  private async iClickRandomConnector(connectorCount: number): Promise<string> {
    const randomIndex = getRandomIndex(connectorCount);
    await this.iNavigateToConnectorPage(randomIndex, connectorCount);

    const connector = this.connectorItemLocator.nth(randomIndex);
    await connector.waitFor({ state: 'attached', timeout: 5000 });
    await expect(connector).toBeVisible();
    const connectorText = await connector.locator('.cg-plugItem__subheadline').textContent();
    await this.iClickConnectorText(connector);
    return connectorText?.trim() || 'unknown';
  }

  private async iClickSpecificConnector(connectorName: string): Promise<string> {
    const connectorLocator = this.connectorItemLocator.filter({ hasText: connectorName });
    const connector = connectorLocator.first();

    await connector.waitFor({ state: 'attached', timeout: 5000 });
    await expect(connector).toBeVisible();
    const connectorText = await connector.locator('.cg-plugItem__subheadline').textContent();
    await this.iClickConnectorText(connector);
    return connectorText?.trim() || connectorName;
  }

  private async iClickConnectorText(connector: Locator) {
    const connectorText = connector.locator('.cg-plugItem__subheadline');
    await connectorText.click({ timeout: 10_000 });
  }

  @Step
  private async iNavigateToConnectorPage(
    connectorIndex: number,
    totalConnectors: number,
  ): Promise<void> {
    const paginationCount = await this.connectorPaginationItemLocator.count();
    const targetPageIndex = calculateTargetPageIndex(
      connectorIndex,
      totalConnectors,
      paginationCount,
    );
    const currentPageIndex = await this.iGetCurrentPageIndex();

    await navigateToPageIndex(
      currentPageIndex,
      targetPageIndex,
      () => this.iNavigateRight(targetPageIndex),
      () => this.iNavigateLeft(targetPageIndex),
    );
  }

  private async iGetCurrentPageIndex(): Promise<number> {
    const paginationCount = await this.connectorPaginationItemLocator.count();

    for (let index = 0; index < paginationCount; index++) {
      const paginationItem = this.connectorPaginationItemLocator.nth(index);
      const isActive = await hasClass(paginationItem, 'active');
      if (isActive) {
        return index;
      }
    }

    return -1;
  }

  private async iNavigateRight(targetPageIndex: number): Promise<boolean> {
    const hasRightArrow = await this.rightArrowLocator.isVisible();
    if (!hasRightArrow) return false;

    await this.rightArrowLocator.click();
    await expect(this.connectorPaginationItemLocator.nth(targetPageIndex)).toHaveClass(/active/, {
      timeout: 5000,
    });
    return true;
  }

  private async iNavigateLeft(targetPageIndex: number): Promise<boolean> {
    const hasLeftArrow = await this.leftArrowLocator.isVisible();
    if (!hasLeftArrow) return false;

    await this.leftArrowLocator.click();
    await expect(this.connectorPaginationItemLocator.nth(targetPageIndex)).toHaveClass(/active/, {
      timeout: 5000,
    });
    return true;
  }
}
