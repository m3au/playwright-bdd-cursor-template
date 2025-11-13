import type { Page } from '@playwright/test';
import { test as baseTest } from '../../world';

export const test = baseTest.extend<{
  HomePage: unknown;
  SignupLoginPage: unknown;
  ProductsPage: unknown;
  ProductDetailsPage: unknown;
  CartPage: unknown;
  CheckoutPage: unknown;
  PaymentPage: unknown;
  OrderConfirmationPage: unknown;
  AccountPage: unknown;
  ContactPage: unknown;
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
  ProductsPage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { ProductsPage } = await import('./poms/pages/products-page');
    const pom = new ProductsPage(page);
    await use(pom);
  },
  ProductDetailsPage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { ProductDetailsPage } = await import('./poms/pages/product-details-page');
    const pom = new ProductDetailsPage(page);
    await use(pom);
  },
  CartPage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { CartPage } = await import('./poms/pages/cart-page');
    const pom = new CartPage(page);
    await use(pom);
  },
  CheckoutPage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { CheckoutPage } = await import('./poms/pages/checkout-page');
    const pom = new CheckoutPage(page);
    await use(pom);
  },
  PaymentPage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { PaymentPage } = await import('./poms/pages/payment-page');
    const pom = new PaymentPage(page);
    await use(pom);
  },
  OrderConfirmationPage: async (
    { page }: { page: Page },
    use: (value: unknown) => Promise<void>,
  ) => {
    const { OrderConfirmationPage } = await import('./poms/pages/order-confirmation-page');
    const pom = new OrderConfirmationPage(page);
    await use(pom);
  },
  AccountPage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { AccountPage } = await import('./poms/pages/account-page');
    const pom = new AccountPage(page);
    await use(pom);
  },
  ContactPage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { ContactPage } = await import('./poms/pages/contact-page');
    const pom = new ContactPage(page);
    await use(pom);
  },
});
