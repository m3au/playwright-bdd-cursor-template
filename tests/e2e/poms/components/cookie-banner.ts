import { Fixture, Given, Step, expect, type Page, type Locator } from '@world';

@Fixture('CookieBanner')
export class CookieBanner {
  private cookieBannerLocator: Locator;
  private acceptButtonLocator: Locator;

  constructor(protected page: Page) {
    this.cookieBannerLocator = this.page.getByRole('heading', { name: 'Served with love!' });
    this.acceptButtonLocator = this.page.getByRole('button', { name: /alright/i });
  }

  @Given('I accept the cookies')
  async acceptCookies(): Promise<void> {
    await this.iSeeTheCookieBanner();
    await this.iClickAcceptCookies();
    await this.iSeeTheCookieBannerDisappears();
  }

  @Step
  private async iSeeTheCookieBanner(): Promise<void> {
    await expect(this.cookieBannerLocator).toBeVisible({ timeout: 5000 });
  }

  @Step
  private async iClickAcceptCookies(): Promise<void> {
    await this.acceptButtonLocator.click();
    await this.cookieBannerLocator.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }

  @Step
  private async iSeeTheCookieBannerDisappears(): Promise<void> {
    await expect(this.cookieBannerLocator).toBeHidden({ timeout: 5000 });
  }
}
