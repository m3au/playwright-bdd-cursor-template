import * as fs from 'node:fs';
import path from 'node:path';

import { expect, test } from '@playwright/test';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';

import { environment, sanitizeTestName, waitForPort } from '@utils';

import { getSharedStyles, themes } from '../../scripts/template-utils';

import { verifyLiveTargetIdentity, writeDegradedDomDiagnostics } from './lighthouse-live-gate';
import {
  isTargetHttpStatus,
  lighthouseLiveMeasurementBlocked,
  requireNumericScore,
  writeMeasurementModeMarker,
} from './measurement';
import { profileForTargetName } from './target-profiles';

interface LighthouseTarget {
  name: string;
  url: string;
  description?: string;
}

const lighthouseTargets: LighthouseTarget[] = [
  {
    name: 'polymer-shop',
    url: environment('BASE_URL_LIGHTHOUSE_POLYMER')!,
    description: 'Polymer Shop Demo – E-commerce performance testing site',
  },
  {
    name: 'w3c-bad',
    url: environment('BASE_URL_LIGHTHOUSE_W3C_BAD')!,
    description: 'W3C Before Fix Demo – Demonstrates accessibility issues that need fixing',
  },
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

function writeSummary(): void {
  const summaryPath = path.join(lighthouseDirectory, 'index.html');
  const templatePath = path.join(process.cwd(), '.github', 'templates', 'lighthouse-summary.html');

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }

  let html = fs.readFileSync(templatePath, 'utf8');

  const listItems = processedTargets
    .map((target) => {
      const targetInfo = lighthouseTargets.find((t) => t.name === target.name);
      const description = targetInfo?.description
        ? `<div class="target-description">${targetInfo.description} – <a href="${target.url}" class="target-url" target="_blank" rel="noopener noreferrer">${target.url}</a></div>`
        : `<div class="target-description"><a href="${target.url}" class="target-url" target="_blank" rel="noopener noreferrer">${target.url}</a></div>`;
      return `<li>
        <a href="./${target.directory}/index.html" class="target-link">${target.name}</a>
        ${description}
      </li>`;
    })
    .join('\n');

  const descriptionHtml = `
      <p>
        These runs enforce baseline thresholds on <strong>live navigation only</strong>
        (performance ≥ <code>${performanceThreshold}</code>,
        accessibility ≥ <code>${accessibilityThreshold}</code>, best-practices ≥ <code>${bestPracticesThreshold}</code>,
        SEO ≥ <code>${seoThreshold}</code>). Intercepted or DOM-only fallbacks are written as degraded
        diagnostics and never satisfy this gate.
      </p>`;

  const notesHtml = `<p class="note">Each link opens the full Lighthouse HTML report for the given target.</p>`;

  const sharedStyles = getSharedStyles(themes.lighthouse);
  html = html.replaceAll('{{SHARED_STYLES}}', sharedStyles);
  html = html.replaceAll('{{DESCRIPTION}}', descriptionHtml);
  html = html.replaceAll('{{LIST_ITEMS}}', listItems);
  html = html.replaceAll('{{NOTES}}', notesHtml);

  fs.writeFileSync(summaryPath, html);
}

type LighthouseRun = Awaited<ReturnType<typeof lighthouse>>;

function numericCategoryScores(
  result: LighthouseRun,
  url: string,
): {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
} {
  const scores = result?.lhr?.categories;
  const statusAudit = result?.lhr?.audits?.['http-status-code'];
  const runtimeError = result?.lhr?.runtimeError;
  const diagnostics = `url=${url} http=${String(statusAudit?.displayValue)} runtime=${runtimeError ? JSON.stringify(runtimeError) : 'none'}`;
  if (!isTargetHttpStatus(statusAudit?.score, statusAudit?.displayValue)) {
    throw new Error(
      `Lighthouse did not measure ${url} (HTTP ${String(statusAudit?.displayValue)}). Invalid measurement before any threshold comparison. ${diagnostics}`,
    );
  }
  return {
    performance: requireNumericScore('performance', scores?.['performance']?.score, diagnostics),
    accessibility: requireNumericScore(
      'accessibility',
      scores?.['accessibility']?.score,
      diagnostics,
    ),
    bestPractices: requireNumericScore(
      'best-practices',
      scores?.['best-practices']?.score,
      diagnostics,
    ),
    seo: requireNumericScore('seo', scores?.['seo']?.score, diagnostics),
  };
}

for (const target of lighthouseTargets) {
  test(`lighthouse audit – ${target.name}`, async ({ browser }) => {
    const browserType = browser?.browserType();
    const executablePath = browserType?.executablePath();
    const profile = profileForTargetName(target.name);

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

      const liveResult = await lighthouse(target.url, lighthouseOptions, desktopConfig);
      if (!liveResult) {
        throw new Error(`Lighthouse returned no result for ${target.url}`);
      }
      const safeName = sanitizeTestName(target.name);
      const targetDirectory = path.join(lighthouseDirectory, safeName);
      fs.mkdirSync(targetDirectory, { recursive: true });

      const liveBlocker = lighthouseLiveMeasurementBlocked(liveResult, target.url);
      const finalUrl = liveResult.lhr?.finalUrl ?? liveResult.lhr?.requestedUrl ?? target.url;

      const timestamp = Date.now();
      const htmlReportPath = path.join(targetDirectory, `lighthouse-report-${timestamp}.html`);
      const reportContent = liveResult?.report;
      // eslint-disable-next-line playwright/no-conditional-in-test -- Report content type check before writing
      if (reportContent && typeof reportContent === 'string') {
        fs.writeFileSync(htmlReportPath, reportContent);
        fs.writeFileSync(path.join(targetDirectory, 'index.html'), reportContent);
      }

      const jsonReportPath = path.join(targetDirectory, `lighthouse-report-${timestamp}.json`);
      fs.writeFileSync(jsonReportPath, JSON.stringify(liveResult?.lhr ?? {}, undefined, 2));

      writeMeasurementModeMarker(targetDirectory, 'live', {
        seedUrl: target.url,
        finalUrl,
        liveGateBlocked: liveBlocker !== undefined,
      });

      processedTargets.push({ name: target.name, directory: safeName, url: target.url });
      writeSummary();

      if (liveBlocker) {
        await writeDegradedDomDiagnostics(targetDirectory, target.url, liveBlocker, desktopConfig);
        throw new Error(
          `Live Lighthouse navigation gate failed for ${target.name}: ${liveBlocker}. Degraded DOM diagnostics were saved under degraded-dom/ and do not satisfy thresholds.`,
        );
      }

      await verifyLiveTargetIdentity(browser, target.url, profile, finalUrl);

      const measured = numericCategoryScores(liveResult, target.url);
      const { performance, accessibility, bestPractices, seo } = measured;

      console.log(`Lighthouse live scores for ${target.name}:`, {
        performance,
        accessibility,
        bestPractices,
        seo,
        finalUrl,
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
