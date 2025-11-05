import * as chromeLauncher from 'chrome-launcher';
import * as fs from 'node:fs';

import { environment, waitForPort } from '@utils';
import { expect, test } from '@playwright/test';

import lighthouse from 'lighthouse';
import path from 'node:path';

const baseUrl = environment('BASE_URL');
const performanceThreshold = +environment('LIGHTHOUSE_PERFORMANCE');
const accessibilityThreshold = +environment('LIGHTHOUSE_ACCESSIBILITY');
const bestPracticesThreshold = +environment('LIGHTHOUSE_BEST_PRACTICES');
const seoThreshold = +environment('LIGHTHOUSE_SEO');
const pwaThreshold = +environment('LIGHTHOUSE_PWA');

const outputDirectory = path.join(process.cwd(), 'test-output');

test.describe('Performance Tests', () => {
  test('should meet performance thresholds', async ({ browser }) => {
    const url = baseUrl;

    const browserType = browser?.browserType();
    const executablePath = browserType?.executablePath();

    // eslint-disable-next-line playwright/no-conditional-in-test -- Required validation before launching browser
    if (!executablePath) throw new Error('Browser executable path not available');

    const chrome = await chromeLauncher.launch({
      chromePath: executablePath,
      chromeFlags: ['--headless', '--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      // eslint-disable-next-line playwright/no-conditional-in-test -- Default port fallback
      const port = chrome.port ?? 9222;
      await waitForPort(port);

      const lighthouseOptions = {
        logLevel: 'info' as const,
        output: 'html' as const,
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
        port,
        preset: 'desktop' as const,
      };

      const runnerResult = await lighthouse(url, lighthouseOptions);

      const lighthouseDirectory = path.join(outputDirectory, 'lighthouse');
      fs.mkdirSync(lighthouseDirectory, { recursive: true });

      const timestamp = Date.now();
      const htmlReportPath = path.join(lighthouseDirectory, `lighthouse-report-${timestamp}.html`);
      const reportContent = runnerResult?.report;
      // eslint-disable-next-line playwright/no-conditional-in-test -- Report content type check before writing
      if (reportContent && typeof reportContent === 'string') {
        fs.writeFileSync(htmlReportPath, reportContent);
        fs.writeFileSync(path.join(lighthouseDirectory, 'index.html'), reportContent);
      }

      const jsonReportPath = path.join(lighthouseDirectory, `lighthouse-report-${timestamp}.json`);
      fs.writeFileSync(jsonReportPath, JSON.stringify(runnerResult?.lhr ?? {}, undefined, 2));

      const scores = runnerResult?.lhr?.categories;
      const performance = scores?.['performance']?.score;
      const accessibility = scores?.['accessibility']?.score;
      const bestPractices = scores?.['best-practices']?.score;
      const seo = scores?.['seo']?.score;
      const pwa = scores?.['pwa']?.score;

      expect(performance).toBeGreaterThanOrEqual(performanceThreshold);
      expect(accessibility).toBeGreaterThanOrEqual(accessibilityThreshold);
      expect(bestPractices).toBeGreaterThanOrEqual(bestPracticesThreshold);
      expect(seo).toBeGreaterThanOrEqual(seoThreshold);
      expect(pwa).toBeGreaterThanOrEqual(pwaThreshold);
    } finally {
      chrome.kill();
    }
  });
});
