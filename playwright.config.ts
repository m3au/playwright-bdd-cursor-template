import { defineConfig, type PlaywrightTestConfig } from '@playwright/test';

import { defineBddConfig } from 'playwright-bdd';
import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { environment, getBrowserProject } from '@utils';

if (!existsSync('.env')) {
  throw new Error('.env file not found. Please copy .env.example to .env and configure it.');
}

dotenv.config({ debug: false, quiet: true });

function createChallengeProject(
  challengeName: string,
  browserName: 'chromium' | 'firefox' | 'webkit',
  deviceName: 'Desktop Chrome' | 'Desktop Firefox' | 'Desktop Safari',
): PlaywrightTestConfig {
  const browserProject = getBrowserProject(browserName, deviceName);
  const challengeBaseUrl = environment(`BASE_URL_${challengeName.toUpperCase()}`)!;
  return {
    name: `${challengeName}-${browserName}`,
    testDir: defineBddConfig({
      features: `tests/e2e/challenges/${challengeName}/**/*.feature`,
      steps: `tests/e2e/challenges/${challengeName}/**/*.ts`,
      outputDir: `test-output/bdd-gen/${challengeName}`,
      importTestFrom: `tests/e2e/challenges/${challengeName}/world.ts`,
      disableWarnings: { importTestFrom: true },
    }),
    testMatch: ['**/*.spec.js'],
    use: {
      ...browserProject.use,
      baseURL: challengeBaseUrl,
      trace: environment('TRACE')! as NonNullable<PlaywrightTestConfig['use']>['trace'],
      screenshot: environment('SCREENSHOT')! as NonNullable<
        PlaywrightTestConfig['use']
      >['screenshot'],
      headless: !environment('HEADED'),
    },
  };
}

const challenges = ['uitestingplayground', 'automationexercise'];

const config: PlaywrightTestConfig = {
  fullyParallel: !!environment('FULLY_PARALLEL'),
  forbidOnly: !!environment('FORBID_ONLY'),
  retries: +environment('RETRIES')!,
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
    ...challenges.flatMap(
      (challenge) =>
        [
          !!environment('CHROMIUM') &&
            createChallengeProject(challenge, 'chromium', 'Desktop Chrome'),
          !!environment('FIREFOX') &&
            createChallengeProject(challenge, 'firefox', 'Desktop Firefox'),
          !!environment('WEBKIT') && createChallengeProject(challenge, 'webkit', 'Desktop Safari'),
        ].filter(Boolean) as PlaywrightTestConfig[],
    ),
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
