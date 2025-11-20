import fs from 'node:fs';
import path from 'node:path';

import { Fixture, Then, When, Step, expect, type Page, type Locator } from '@world';

@Fixture('FileUploadPage')
export class FileUploadPage {
  private pageTitleLocator: Locator;
  private fileInputLocator: Locator;
  private uploadButtonLocator: Locator;
  private resultLocator: Locator;

  constructor(protected page: Page) {
    this.pageTitleLocator = this.page.getByRole('heading', { level: 3 });
    // File upload is in an iframe
    // File input - typically has type="file" in the iframe
    this.fileInputLocator = this.page.frameLocator('iframe').locator('input[type="file"]');
    this.uploadButtonLocator = this.page
      .frameLocator('iframe')
      .getByRole('button', { name: /browse|upload/i });
    // Result message after upload (might be in iframe or main page)
    this.resultLocator = this.page.frameLocator('iframe').locator('text=/uploaded|success|file/i');
  }

  @Then('I see the File Upload page')
  async verifyPageLoaded(): Promise<void> {
    await this.iSeeTheFileUploadPage();
  }

  @Step
  private async iSeeTheFileUploadPage(): Promise<void> {
    await expect(this.pageTitleLocator).toBeVisible({ timeout: 10_000 });
    await expect(this.pageTitleLocator).toHaveText('File Upload');
  }

  @When('I upload a file')
  async uploadFile(): Promise<void> {
    await this.iUploadAFile();
  }

  @Step
  private async iUploadAFile(): Promise<void> {
    // Create a temporary test file
    const testFileContent = 'Test file content for upload';
    const testFilePath = path.join(process.cwd(), 'test-upload.txt');
    fs.writeFileSync(testFilePath, testFileContent);

    try {
      // File input is in iframe - it's hidden but exists, so check for existence
      // File inputs are typically hidden, so we check if it exists rather than is visible
      await this.fileInputLocator.waitFor({ state: 'attached', timeout: 10_000 });
      await this.fileInputLocator.setInputFiles(testFilePath);

      // Wait for file to be processed - check for file name or upload indicator
      await expect(this.resultLocator.first()).toBeVisible({ timeout: 5000 });
    } finally {
      // Clean up test file
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    }
  }

  @Then('the file is uploaded successfully')
  async verifyFileUploaded(): Promise<void> {
    await this.iVerifyFileUploaded();
  }

  @Step
  private async iVerifyFileUploaded(): Promise<void> {
    // File upload might show file name or success message
    // Check iframe for any indication of successful upload
    const iframe = this.page.frameLocator('iframe');
    // Check if file name appears or upload area shows file
    const fileIndicator = iframe.locator('text=/test-upload|file|uploaded/i');
    await expect(fileIndicator.first()).toBeVisible({ timeout: 10_000 });
  }
}
