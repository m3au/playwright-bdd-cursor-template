import { defineConfig, type PlaywrightTestConfig } from '@playwright/test';

import { defineBddConfig } from 'playwright-bdd';
import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { environment, getBrowserProject } from '@utils';

if (!existsSync('.env')) {
  throw new Error('.env file not found. Please copy .env.example to .env and configure it.');
}

dotenv.config({ debug: false, quiet: true });

const config: PlaywrightTestConfig = {
  testDir: defineBddConfig({
    features: 'tests/e2e/features/**/*.feature',
    steps: 'tests/e2e/poms/**/*.ts',
    outputDir: 'test-output/bdd-gen',
    importTestFrom: 'tests/e2e/world.ts',
    disableWarnings: { importTestFrom: true },
  }),
  testMatch: ['**/*.spec.ts', '**/*.test.ts', '**/*.spec.js', '**/*.test.js'],
  fullyParallel: environment('FULLY_PARALLEL') !== 'false',
  forbidOnly: false,
  retries: +environment('RETRIES'),
  repeatEach: +environment('REPEAT_EACH'),
  // eslint-disable-next-line unicorn/no-unreadable-iife
  workers: ((v) => (v.endsWith('%') ? v : +v))(environment('WORKERS')),
  timeout: +environment('TIMEOUT'),
  expect: { timeout: +environment('EXPECT_TIMEOUT') },
  reporter: [['html', { open: 'never', outputFolder: 'test-output/playwright-report' }], ['line']],
  outputDir: 'test-output/test-results',
  use: {
    baseURL: environment('BASE_URL'),
    trace: environment('TRACE') as NonNullable<PlaywrightTestConfig['use']>['trace'],
    screenshot: environment('SCREENSHOT') as NonNullable<PlaywrightTestConfig['use']>['screenshot'],
    headless: !environment('HEADED'),
  },
  projects: [
    ...(environment('CHROMIUM') ? [getBrowserProject('chromium', 'Desktop Chrome')] : []),
    ...(environment('FIREFOX') ? [getBrowserProject('firefox', 'Desktop Firefox')] : []),
    ...(environment('WEBKIT') ? [getBrowserProject('webkit', 'Desktop Safari')] : []),
    {
      name: 'lighthouse',
      testDir: 'tests/audit',
      testMatch: ['lighthouse.spec.ts'],
      retries: 0,
      repeatEach: 0,
    },
    {
      name: 'axe',
      testDir: 'tests/audit',
      testMatch: ['axe.spec.ts'],
      retries: 0,
      repeatEach: 0,
    },
  ],
};

const isCI = !!process.env['CI'] || !!process.env['GITHUB_ACTIONS'];

if (isCI) {
  config.forbidOnly = true;
  config.reporter = [['line'], ['blob'], ['github']];
}

export default defineConfig(config);
