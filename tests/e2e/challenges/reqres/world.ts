import type { APIRequestContext, TestInfo } from '@playwright/test';
import { test as bddTest } from 'playwright-bdd';

import {
  appendBugReport,
  clearTestContext,
  getTestContext,
  attachFileFromStep,
  createBugReport,
  type TestContext,
  getEnvironment,
  environment,
} from '@utils';

export type { APIRequestContext, TestInfo } from '@playwright/test';
export { Fixture, Given, Then, When } from 'playwright-bdd/decorators';
export type { TestContext } from '@utils';
export { attachFileFromStep, Step } from '@utils';
export { getEnvironment, environment } from '@utils';
export type { EnvironmentConfig, DataConfig } from '@utils';

import { AuthService } from './services/auth-service';
import { UsersService } from './services/users-service';

export const test = bddTest.extend<{
  testInfo: TestInfo;
  request: APIRequestContext;
  AuthService: AuthService;
  ReqresUsersService: UsersService;
  world: {
    request: APIRequestContext;
    data: ReturnType<typeof getEnvironment>;
    testContext: TestContext;
    testInfo: TestInfo;
  };
}>({
  testInfo: async ({}, use, testInfo: TestInfo) => {
    await use(testInfo);
  },
  request: async ({ playwright }, use) => {
    const baseURL = environment('BASE_URL_REQRES')!;
    // ReqRes.in requires x-api-key. environment() throws when a name is unset, so the
    // published free-tier key is used unless REQRES_API_KEY is already configured.
    const configuredKey = process.env['REQRES_API_KEY'];
    const apiKey = configuredKey && configuredKey.length > 0 ? configuredKey : 'reqres-free-v1';
    const requestContext = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: {
        'User-Agent': 'Playwright Test',
        Accept: 'application/json',
        'x-api-key': apiKey,
      },
    });
    await use(requestContext);
    await requestContext.dispose();
  },
  AuthService: async ({ request }, use) => {
    await use(new AuthService(request));
  },
  ReqresUsersService: async ({ request }, use) => {
    await use(new UsersService(request));
  },
  world: async ({ request, testInfo }, use) => {
    const data = getEnvironment();
    const testContext = getTestContext(testInfo.testId);
    const world = {
      request,
      data,
      testContext,
      testInfo,
    };

    await use(world);

    const hasError = testInfo.error || testInfo.status === 'failed';
    if (hasError) {
      const bugReport = createBugReport(testInfo, testContext);

      await appendBugReport(bugReport).catch((error) => {
        console.error('Failed to write bug report to BUGS.json:', error);
      });

      try {
        const jsonString = JSON.stringify(bugReport, undefined, 2);
        await attachFileFromStep('bug-report.json', jsonString);
      } catch (error) {
        console.error('Failed to attach bug-report.json:', error);
      }

      clearTestContext(testInfo.testId);
    }
  },
});
