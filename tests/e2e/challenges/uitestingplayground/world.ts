import type { Page } from '@playwright/test';
import { test as baseTest } from '../../world';

export const test = baseTest.extend<{
  HomePage: unknown;
  DynamicIdPage: unknown;
  ClassAttributePage: unknown;
  VerifyTextPage: unknown;
  NonBreakingSpacePage: unknown;
  SampleAppPage: unknown;
  LoadDelayPage: unknown;
  AjaxDataPage: unknown;
  ClientSideDelayPage: unknown;
  ProgressBarPage: unknown;
  AnimatedButtonPage: unknown;
  DisabledInputPage: unknown;
  AutoWaitPage: unknown;
  ClickPage: unknown;
  TextInputPage: unknown;
  MouseOverPage: unknown;
  ScrollbarsPage: unknown;
  OverlappedElementPage: unknown;
  DynamicTablePage: unknown;
  ShadowDomPage: unknown;
  VisibilityPage: unknown;
  HiddenLayersPage: unknown;
  AlertsPage: unknown;
  FileUploadPage: unknown;
}>({
  HomePage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { HomePage } = await import('./poms/pages/home-page');
    const pom = new HomePage(page);
    await use(pom);
  },
  DynamicIdPage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { DynamicIdPage } = await import('./poms/pages/dynamic-id-page');
    const pom = new DynamicIdPage(page);
    await use(pom);
  },
  ClassAttributePage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { ClassAttributePage } = await import('./poms/pages/class-attribute-page');
    const pom = new ClassAttributePage(page);
    await use(pom);
  },
  VerifyTextPage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { VerifyTextPage } = await import('./poms/pages/verify-text-page');
    const pom = new VerifyTextPage(page);
    await use(pom);
  },
  NonBreakingSpacePage: async (
    { page }: { page: Page },
    use: (value: unknown) => Promise<void>,
  ) => {
    const { NonBreakingSpacePage } = await import('./poms/pages/non-breaking-space-page');
    const pom = new NonBreakingSpacePage(page);
    await use(pom);
  },
  SampleAppPage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { SampleAppPage } = await import('./poms/pages/sample-app-page');
    const pom = new SampleAppPage(page);
    await use(pom);
  },
  LoadDelayPage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { LoadDelayPage } = await import('./poms/pages/load-delay-page');
    const pom = new LoadDelayPage(page);
    await use(pom);
  },
  AjaxDataPage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { AjaxDataPage } = await import('./poms/pages/ajax-data-page');
    const pom = new AjaxDataPage(page);
    await use(pom);
  },
  ClientSideDelayPage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { ClientSideDelayPage } = await import('./poms/pages/client-side-delay-page');
    const pom = new ClientSideDelayPage(page);
    await use(pom);
  },
  ProgressBarPage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { ProgressBarPage } = await import('./poms/pages/progress-bar-page');
    const pom = new ProgressBarPage(page);
    await use(pom);
  },
  AnimatedButtonPage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { AnimatedButtonPage } = await import('./poms/pages/animated-button-page');
    const pom = new AnimatedButtonPage(page);
    await use(pom);
  },
  DisabledInputPage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { DisabledInputPage } = await import('./poms/pages/disabled-input-page');
    const pom = new DisabledInputPage(page);
    await use(pom);
  },
  AutoWaitPage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { AutoWaitPage } = await import('./poms/pages/auto-wait-page');
    const pom = new AutoWaitPage(page);
    await use(pom);
  },
  ClickPage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { ClickPage } = await import('./poms/pages/click-page');
    const pom = new ClickPage(page);
    await use(pom);
  },
  TextInputPage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { TextInputPage } = await import('./poms/pages/text-input-page');
    const pom = new TextInputPage(page);
    await use(pom);
  },
  MouseOverPage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { MouseOverPage } = await import('./poms/pages/mouse-over-page');
    const pom = new MouseOverPage(page);
    await use(pom);
  },
  ScrollbarsPage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { ScrollbarsPage } = await import('./poms/pages/scrollbars-page');
    const pom = new ScrollbarsPage(page);
    await use(pom);
  },
  OverlappedElementPage: async (
    { page }: { page: Page },
    use: (value: unknown) => Promise<void>,
  ) => {
    const { OverlappedElementPage } = await import('./poms/pages/overlapped-element-page');
    const pom = new OverlappedElementPage(page);
    await use(pom);
  },
  DynamicTablePage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { DynamicTablePage } = await import('./poms/pages/dynamic-table-page');
    const pom = new DynamicTablePage(page);
    await use(pom);
  },
  ShadowDomPage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { ShadowDomPage } = await import('./poms/pages/shadow-dom-page');
    const pom = new ShadowDomPage(page);
    await use(pom);
  },
  VisibilityPage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { VisibilityPage } = await import('./poms/pages/visibility-page');
    const pom = new VisibilityPage(page);
    await use(pom);
  },
  HiddenLayersPage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { HiddenLayersPage } = await import('./poms/pages/hidden-layers-page');
    const pom = new HiddenLayersPage(page);
    await use(pom);
  },
  AlertsPage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { AlertsPage } = await import('./poms/pages/alerts-page');
    const pom = new AlertsPage(page);
    await use(pom);
  },
  FileUploadPage: async ({ page }: { page: Page }, use: (value: unknown) => Promise<void>) => {
    const { FileUploadPage } = await import('./poms/pages/file-upload-page');
    const pom = new FileUploadPage(page);
    await use(pom);
  },
});
