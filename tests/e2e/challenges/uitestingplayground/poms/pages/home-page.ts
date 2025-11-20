import { Fixture, Given, When, Step, expect, environment, type Page, type Locator } from '@world';

@Fixture('HomePage')
export class HomePage {
  private pageTitleLocator: Locator;
  private dynamicIdLinkLocator: Locator;
  private classAttributeLinkLocator: Locator;
  private hiddenLayersLinkLocator: Locator;
  private loadDelayLinkLocator: Locator;
  private ajaxDataLinkLocator: Locator;
  private clientSideDelayLinkLocator: Locator;
  private clickLinkLocator: Locator;
  private textInputLinkLocator: Locator;
  private scrollbarsLinkLocator: Locator;
  private dynamicTableLinkLocator: Locator;
  private verifyTextLinkLocator: Locator;
  private progressBarLinkLocator: Locator;
  private visibilityLinkLocator: Locator;
  private sampleAppLinkLocator: Locator;
  private mouseOverLinkLocator: Locator;
  private nonBreakingSpaceLinkLocator: Locator;
  private overlappedElementLinkLocator: Locator;
  private shadowDomLinkLocator: Locator;
  private alertsLinkLocator: Locator;
  private fileUploadLinkLocator: Locator;
  private animatedButtonLinkLocator: Locator;
  private disabledInputLinkLocator: Locator;
  private autoWaitLinkLocator: Locator;

  constructor(protected page: Page) {
    this.pageTitleLocator = this.page.getByRole('heading', { level: 1 });
    this.dynamicIdLinkLocator = this.page.getByRole('link', { name: 'Dynamic ID' });
    this.classAttributeLinkLocator = this.page.getByRole('link', { name: 'Class Attribute' });
    this.hiddenLayersLinkLocator = this.page.getByRole('link', { name: 'Hidden Layers' });
    this.loadDelayLinkLocator = this.page.getByRole('link', { name: 'Load Delay' });
    this.ajaxDataLinkLocator = this.page.getByRole('link', { name: 'AJAX Data' });
    this.clientSideDelayLinkLocator = this.page.getByRole('link', { name: 'Client Side Delay' });
    this.clickLinkLocator = this.page.getByRole('link', { name: 'Click' });
    this.textInputLinkLocator = this.page.getByRole('link', { name: 'Text Input' });
    this.scrollbarsLinkLocator = this.page.getByRole('link', { name: 'Scrollbars' });
    this.dynamicTableLinkLocator = this.page.getByRole('link', { name: 'Dynamic Table' });
    this.verifyTextLinkLocator = this.page.getByRole('link', { name: 'Verify Text' });
    this.progressBarLinkLocator = this.page.getByRole('link', { name: 'Progress Bar' });
    this.visibilityLinkLocator = this.page.getByRole('link', { name: 'Visibility' });
    this.sampleAppLinkLocator = this.page.getByRole('link', { name: 'Sample App' });
    this.mouseOverLinkLocator = this.page.getByRole('link', { name: 'Mouse Over' });
    this.nonBreakingSpaceLinkLocator = this.page.getByRole('link', { name: 'Non-Breaking Space' });
    this.overlappedElementLinkLocator = this.page.getByRole('link', { name: 'Overlapped Element' });
    this.shadowDomLinkLocator = this.page.getByRole('link', { name: 'Shadow DOM' });
    this.alertsLinkLocator = this.page.getByRole('link', { name: 'Alerts' });
    this.fileUploadLinkLocator = this.page.getByRole('link', { name: 'File Upload' });
    this.animatedButtonLinkLocator = this.page.getByRole('link', { name: 'Animated Button' });
    this.disabledInputLinkLocator = this.page.getByRole('link', { name: 'Disabled Input' });
    this.autoWaitLinkLocator = this.page.getByRole('link', { name: 'Auto Wait' });
  }

  // eslint-disable-next-line no-secrets/no-secrets -- False positive: application name
  @Given('I navigate to the UITestingPlayground home page')
  async navigate(): Promise<void> {
    const baseUrl = environment('BASE_URL_UITESTINGPLAYGROUND')!;
    await this.page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await this.iSeeTheHomePage();
  }

  @Step
  async iSeeTheHomePage(): Promise<void> {
    await expect(this.pageTitleLocator).toBeVisible({ timeout: 10_000 });
    await expect(this.pageTitleLocator).toHaveText(/UI Test Automation/i);
  }

  @When('I navigate to the Dynamic ID page')
  async navigateToDynamicId(): Promise<void> {
    await this.iNavigateToDynamicId();
  }

  @Step
  private async iNavigateToDynamicId(): Promise<void> {
    await this.dynamicIdLinkLocator.click();
  }

  @When('I navigate to the Class Attribute page')
  async navigateToClassAttribute(): Promise<void> {
    await this.iNavigateToClassAttribute();
  }

  @Step
  private async iNavigateToClassAttribute(): Promise<void> {
    await this.classAttributeLinkLocator.click();
  }

  @When('I navigate to the Hidden Layers page')
  async navigateToHiddenLayers(): Promise<void> {
    await this.iNavigateToHiddenLayers();
  }

  @Step
  private async iNavigateToHiddenLayers(): Promise<void> {
    await this.hiddenLayersLinkLocator.click();
  }

  @When('I navigate to the Load Delay page')
  async navigateToLoadDelay(): Promise<void> {
    await this.iNavigateToLoadDelay();
  }

  @Step
  private async iNavigateToLoadDelay(): Promise<void> {
    await this.loadDelayLinkLocator.click();
  }

  @When('I navigate to the AJAX Data page')
  async navigateToAjaxData(): Promise<void> {
    await this.iNavigateToAjaxData();
  }

  @Step
  private async iNavigateToAjaxData(): Promise<void> {
    await this.ajaxDataLinkLocator.click();
  }

  @When('I navigate to the Client Side Delay page')
  async navigateToClientSideDelay(): Promise<void> {
    await this.iNavigateToClientSideDelay();
  }

  @Step
  private async iNavigateToClientSideDelay(): Promise<void> {
    await this.clientSideDelayLinkLocator.click();
  }

  @When('I navigate to the Click page')
  async navigateToClick(): Promise<void> {
    await this.iNavigateToClick();
  }

  @Step
  private async iNavigateToClick(): Promise<void> {
    await this.clickLinkLocator.click();
  }

  @When('I navigate to the Text Input page')
  async navigateToTextInput(): Promise<void> {
    await this.iNavigateToTextInput();
  }

  @Step
  private async iNavigateToTextInput(): Promise<void> {
    await this.textInputLinkLocator.click();
  }

  @When('I navigate to the Scrollbars page')
  async navigateToScrollbars(): Promise<void> {
    await this.iNavigateToScrollbars();
  }

  @Step
  private async iNavigateToScrollbars(): Promise<void> {
    await this.scrollbarsLinkLocator.click();
  }

  @When('I navigate to the Dynamic Table page')
  async navigateToDynamicTable(): Promise<void> {
    await this.iNavigateToDynamicTable();
  }

  @Step
  private async iNavigateToDynamicTable(): Promise<void> {
    await this.dynamicTableLinkLocator.click();
  }

  @When('I navigate to the Verify Text page')
  async navigateToVerifyText(): Promise<void> {
    await this.iNavigateToVerifyText();
  }

  @Step
  private async iNavigateToVerifyText(): Promise<void> {
    await this.verifyTextLinkLocator.click();
  }

  @When('I navigate to the Progress Bar page')
  async navigateToProgressBar(): Promise<void> {
    await this.iNavigateToProgressBar();
  }

  @Step
  private async iNavigateToProgressBar(): Promise<void> {
    await this.progressBarLinkLocator.click();
  }

  @When('I navigate to the Visibility page')
  async navigateToVisibility(): Promise<void> {
    await this.iNavigateToVisibility();
  }

  @Step
  private async iNavigateToVisibility(): Promise<void> {
    await this.visibilityLinkLocator.click();
  }

  @When('I navigate to the Sample App page')
  async navigateToSampleApp(): Promise<void> {
    await this.iNavigateToSampleApp();
  }

  @Step
  private async iNavigateToSampleApp(): Promise<void> {
    await this.sampleAppLinkLocator.click();
  }

  @When('I navigate to the Mouse Over page')
  async navigateToMouseOver(): Promise<void> {
    await this.iNavigateToMouseOver();
  }

  @Step
  private async iNavigateToMouseOver(): Promise<void> {
    await this.mouseOverLinkLocator.click();
  }

  @When('I navigate to the Non-Breaking Space page')
  async navigateToNonBreakingSpace(): Promise<void> {
    await this.iNavigateToNonBreakingSpace();
  }

  @Step
  private async iNavigateToNonBreakingSpace(): Promise<void> {
    await this.nonBreakingSpaceLinkLocator.click();
  }

  @When('I navigate to the Overlapped Element page')
  async navigateToOverlappedElement(): Promise<void> {
    await this.iNavigateToOverlappedElement();
  }

  @Step
  private async iNavigateToOverlappedElement(): Promise<void> {
    await this.overlappedElementLinkLocator.click();
  }

  @When('I navigate to the Shadow DOM page')
  async navigateToShadowDom(): Promise<void> {
    await this.iNavigateToShadowDom();
  }

  @Step
  private async iNavigateToShadowDom(): Promise<void> {
    await this.shadowDomLinkLocator.click();
  }

  @When('I navigate to the Alerts page')
  async navigateToAlerts(): Promise<void> {
    await this.iNavigateToAlerts();
  }

  @Step
  private async iNavigateToAlerts(): Promise<void> {
    await this.alertsLinkLocator.click();
  }

  @When('I navigate to the File Upload page')
  async navigateToFileUpload(): Promise<void> {
    await this.iNavigateToFileUpload();
  }

  @Step
  private async iNavigateToFileUpload(): Promise<void> {
    await this.fileUploadLinkLocator.click();
  }

  @When('I navigate to the Animated Button page')
  async navigateToAnimatedButton(): Promise<void> {
    await this.iNavigateToAnimatedButton();
  }

  @Step
  private async iNavigateToAnimatedButton(): Promise<void> {
    await this.animatedButtonLinkLocator.click();
  }

  @When('I navigate to the Disabled Input page')
  async navigateToDisabledInput(): Promise<void> {
    await this.iNavigateToDisabledInput();
  }

  @Step
  private async iNavigateToDisabledInput(): Promise<void> {
    await this.disabledInputLinkLocator.click();
  }

  @When('I navigate to the Auto Wait page')
  async navigateToAutoWait(): Promise<void> {
    await this.iNavigateToAutoWait();
  }

  @Step
  private async iNavigateToAutoWait(): Promise<void> {
    await this.autoWaitLinkLocator.click();
  }
}
