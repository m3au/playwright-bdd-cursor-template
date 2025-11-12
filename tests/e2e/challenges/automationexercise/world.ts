import type { Page } from '@playwright/test';
import { test as baseTest } from '../../world';

export const test = baseTest.extend<{
  HomePage: unknown;
  SignupLoginPage: unknown;
}>({
  HomePage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { HomePage } = await import('./poms/pages/home-page');
    const pom = new HomePage(page);
    await use(pom);
  },
  SignupLoginPage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { SignupLoginPage } = await import('./poms/pages/signup-login-page');
    const pom = new SignupLoginPage(page);
    await use(pom);
  },
});
