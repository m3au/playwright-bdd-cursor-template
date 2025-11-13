import * as chromeLauncher from 'chrome-launcher';
import * as fs from 'node:fs';

import { environment, waitForPort } from '@utils';
import { expect, test } from '@playwright/test';

import lighthouse from 'lighthouse';
import path from 'node:path';

interface LighthouseTarget {
  name: string;
  url: string;
}

const lighthouseTargets: LighthouseTarget[] = [
  { name: 'polymer-shop', url: environment('BASE_URL_LIGHTHOUSE_POLYMER')! },
  { name: 'w3c-bad', url: environment('BASE_URL_LIGHTHOUSE_W3C_BAD')! },
];

const performanceThreshold = +environment('LIGHTHOUSE_PERFORMANCE')!;
const accessibilityThreshold = +environment('LIGHTHOUSE_ACCESSIBILITY')!;
const bestPracticesThreshold = +environment('LIGHTHOUSE_BEST_PRACTICES')!;
const seoThreshold = +environment('LIGHTHOUSE_SEO')!;

const outputDirectory = path.join(process.cwd(), 'test-output');
const lighthouseDirectory = path.join(outputDirectory, 'lighthouse');

const processedTargets: { name: string; directory: string; url: string }[] = [];

fs.mkdirSync(lighthouseDirectory, { recursive: true });

test.describe.configure({ mode: 'serial' });

function sanitizeName(name: string): string {
  const segments = name.toLowerCase().match(/[a-z0-9]+/g);
  return segments?.join('-') ?? 'target';
}

function writeSummary(): void {
  const summaryPath = path.join(lighthouseDirectory, 'index.html');
  const listItems = processedTargets
    .map(
      (target) =>
        `<li><a href="./${target.directory}/index.html">${target.name}</a><br /><small>${target.url}</small></li>`,
    )
    .join('\n');

  const summaryHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Lighthouse Performance Audits</title>
    <style>
      body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #020617; color: #e2e8f0; margin: 0; padding: 3rem 1.5rem; }
      .container { max-width: 960px; margin: 0 auto; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(18px); border-radius: 16px; padding: 2.5rem; box-shadow: 0 25px 50px -12px rgba(2, 6, 23, 0.7); }
      h1 { margin-top: 0; font-size: 2rem; }
      p { color: #94a3b8; line-height: 1.6; }
      ul { list-style: none; margin: 2rem 0 0; padding: 0; display: grid; gap: 1rem; }
      li { background: rgba(30, 41, 59, 0.9); border-radius: 12px; padding: 1rem 1.25rem; border: 1px solid rgba(148, 163, 184, 0.2); transition: transform 0.2s ease, border-color 0.2s ease; }
      li:hover { transform: translateY(-3px); border-color: #f97316; }
      a { color: #fb923c; text-decoration: none; font-weight: 600; }
      a:hover { text-decoration: underline; }
      small { color: #64748b; }
      .note { margin-top: 2rem; font-size: 0.875rem; color: #cbd5f5; }
      code { background: rgba(30, 41, 59, 0.7); padding: 0.1rem 0.4rem; border-radius: 4px; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>🗼 Lighthouse Performance Audits</h1>
      <p>
        These runs enforce baseline thresholds (performance ≥ <code>${performanceThreshold}</code>,
        accessibility ≥ <code>${accessibilityThreshold}</code>, best-practices ≥ <code>${bestPracticesThreshold}</code>,
        SEO ≥ <code>${seoThreshold}</code>). If a regression drops below these targets the step fails,
        but otherwise the workflow continues and publishes the reports.
      </p>
      <ul>
        ${listItems}
      </ul>
      <p class="note">Each link opens the full Lighthouse HTML report for the given target.</p>
    </div>
  </body>
</html>`;

  fs.writeFileSync(summaryPath, summaryHtml);
}

for (const target of lighthouseTargets) {
  test(`lighthouse audit – ${target.name}`, async ({ browser }) => {
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

      const desktopConfig = {
        extends: 'lighthouse:default',
        settings: {
          formFactor: 'desktop' as const,
          throttling: {
            rttMs: 40,
            throughputKbps: 10 * 1024,
            cpuSlowdownMultiplier: 1,
            requestLatencyMs: 0,
            downloadThroughputKbps: 0,
            uploadThroughputKbps: 0,
          },
          screenEmulation: {
            mobile: false,
            width: 1350,
            height: 940,
            deviceScaleFactor: 1,
            disabled: false,
          },
          emulatedUserAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      };

      const categories: string[] = ['performance', 'accessibility', 'best-practices', 'seo'];
      const lighthouseOptions = {
        logLevel: 'info' as const,
        output: 'html' as const,
        onlyCategories: categories,
        port,
      };

      const runnerResult = await lighthouse(target.url, lighthouseOptions, desktopConfig);

      const safeName = sanitizeName(target.name);
      const targetDirectory = path.join(lighthouseDirectory, safeName);
      fs.mkdirSync(targetDirectory, { recursive: true });

      const timestamp = Date.now();
      const htmlReportPath = path.join(targetDirectory, `lighthouse-report-${timestamp}.html`);
      const reportContent = runnerResult?.report;
      // eslint-disable-next-line playwright/no-conditional-in-test -- Report content type check before writing
      if (reportContent && typeof reportContent === 'string') {
        fs.writeFileSync(htmlReportPath, reportContent);
        fs.writeFileSync(path.join(targetDirectory, 'index.html'), reportContent);
      }

      const jsonReportPath = path.join(targetDirectory, `lighthouse-report-${timestamp}.json`);
      fs.writeFileSync(jsonReportPath, JSON.stringify(runnerResult?.lhr ?? {}, undefined, 2));

      processedTargets.push({ name: target.name, directory: safeName, url: target.url });
      writeSummary();

      const scores = runnerResult?.lhr?.categories;
      const performance = scores?.['performance']?.score;
      const accessibility = scores?.['accessibility']?.score;
      const bestPractices = scores?.['best-practices']?.score;
      const seo = scores?.['seo']?.score;

      console.log(`Lighthouse scores for ${target.name}:`, {
        performance,
        accessibility,
        bestPractices,
        seo,
      });

      expect(performance).toBeGreaterThanOrEqual(performanceThreshold);
      expect(accessibility).toBeGreaterThanOrEqual(accessibilityThreshold);
      expect(bestPractices).toBeGreaterThanOrEqual(bestPracticesThreshold);
      expect(seo).toBeGreaterThanOrEqual(seoThreshold);
    } finally {
      chrome.kill();
    }
  });
}
