import { existsSync } from 'node:fs';

import { defineConfig, type PlaywrightTestConfig } from '@playwright/test';
import dotenv from 'dotenv';
import { defineBddConfig } from 'playwright-bdd';

import { environment, getBrowserProject } from '@utils';

if (!existsSync('.env')) {
  throw new Error('.env file not found. Please copy .env.example to .env and configure it.');
}

dotenv.config({ debug: false, quiet: true });

const challenges = ['uitestingplayground', 'automationexercise'];

const baseRetries = +environment('RETRIES')!;
const baseUseConfig = {
  trace: environment('TRACE')! as NonNullable<PlaywrightTestConfig['use']>['trace'],
  screenshot: environment('SCREENSHOT')! as NonNullable<PlaywrightTestConfig['use']>['screenshot'],
  headless: !environment('HEADED'),
} satisfies Partial<PlaywrightTestConfig['use']>;

const config: PlaywrightTestConfig = {
  fullyParallel: !!environment('FULLY_PARALLEL'),
  forbidOnly: !!environment('FORBID_ONLY'),
  retries: baseRetries,
  repeatEach: +environment('REPEAT_EACH')!,
  maxFailures: +environment('MAX_FAILURES')!,
  workers: (() => {
    const workersValue = environment('WORKERS')!;
    return workersValue.endsWith('%') ? workersValue : +workersValue;
  })(),
  timeout: +environment('TIMEOUT')!,
  expect: { timeout: +environment('EXPECT_TIMEOUT')! },
  reporter: [['html', { open: 'never', outputFolder: 'test-output/playwright-report' }], ['line']],
  outputDir: 'test-output/test-results',
  projects: [
    // Create challenge projects for each browser
    ...challenges.flatMap((challenge) => {
      const challengeBaseUrl = environment(`BASE_URL_${challenge.toUpperCase()}`)!;
      // automationexercise tests against external site are more flaky, add extra retry
      const projectRetries = challenge === 'automationexercise' ? baseRetries + 1 : baseRetries;

      const defaultProjectConfig = {
        testDir: defineBddConfig({
          features: `tests/e2e/challenges/${challenge}/**/*.feature`,
          steps: `tests/e2e/challenges/${challenge}/**/*.ts`,
          outputDir: `test-output/bdd-gen/${challenge}`,
          importTestFrom: `tests/e2e/challenges/${challenge}/world.ts`,
          disableWarnings: { importTestFrom: true },
        }),
        testMatch: ['**/*.spec.js'] as const,
        retries: projectRetries,
        use: {
          ...baseUseConfig,
          baseURL: challengeBaseUrl,
        },
      } satisfies Partial<PlaywrightTestConfig>;

      return [
        !!environment('CHROMIUM') &&
          ({
            ...defaultProjectConfig,
            name: `${challenge}-chromium`,
            use: {
              ...getBrowserProject('chromium', 'Desktop Chrome').use,
              ...defaultProjectConfig.use,
            },
          } satisfies PlaywrightTestConfig),
        !!environment('FIREFOX') &&
          ({
            ...defaultProjectConfig,
            name: `${challenge}-firefox`,
            use: {
              ...getBrowserProject('firefox', 'Desktop Firefox').use,
              ...defaultProjectConfig.use,
            },
          } satisfies PlaywrightTestConfig),
        !!environment('WEBKIT') &&
          ({
            ...defaultProjectConfig,
            name: `${challenge}-webkit`,
            use: {
              ...getBrowserProject('webkit', 'Desktop Safari').use,
              ...defaultProjectConfig.use,
            },
          } satisfies PlaywrightTestConfig),
      ].filter(Boolean) as PlaywrightTestConfig[];
    }),
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
