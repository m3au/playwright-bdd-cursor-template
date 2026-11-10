import * as fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';

import { chromium, expect, test } from '@playwright/test';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';

import { environment, sanitizeTestName, waitForPort } from '@utils';

import { getSharedStyles, themes } from '../../scripts/template-utils';

import {
  assertLiveTargetDocument,
  assertProbedLiveTargetDocument,
  isTargetHttpStatus,
  lighthouseLiveMeasurementBlocked,
  prefetchAuditDocument,
  requireNumericScore,
  verifyEssentialAssets,
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

async function measureDegradedDomDocument(
  url: string,
  config: Parameters<typeof lighthouse>[2],
): Promise<LighthouseRun> {
  const prefetched = await prefetchAuditDocument(url);
  if (prefetched.status !== 200) {
    throw new Error(
      `Degraded DOM probe could not prefetch ${url} (status ${prefetched.status}).`,
    );
  }

  const port = await new Promise<number>((resolve, reject) => {
    const listener = net.createServer();
    listener.listen(0, '127.0.0.1', () => {
      const address = listener.address();
      const freePort = typeof address === 'object' && address ? address.port : 0;
      listener.close(() => resolve(freePort));
    });
    listener.on('error', reject);
  });

  const browser = await chromium.launch({
    headless: true,
    args: [`--remote-debugging-port=${port}`, '--remote-allow-origins=*'],
  });
  try {
    const session = await browser.newBrowserCDPSession();
    await session.send('Fetch.enable', {
      patterns: [{ urlPattern: `${url}*`, requestStage: 'Request' }],
    });
    session.on('Fetch.requestPaused', async (event) => {
      if (event.resourceType === 'Document' && event.request.url.startsWith(url)) {
        await session.send('Fetch.fulfillRequest', {
          requestId: event.requestId,
          responseCode: 200,
          responseHeaders: [{ name: 'content-type', value: 'text/html; charset=utf-8' }],
          body: Buffer.from(prefetched.html).toString('base64'),
        });
        return;
      }
      await session.send('Fetch.continueRequest', { requestId: event.requestId });
    });
    return await lighthouse(
      url,
      {
        logLevel: 'error',
        output: 'html',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        port,
      },
      config,
    );
  } finally {
    await browser.close();
  }
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
        const degradedDirectory = path.join(targetDirectory, 'degraded-dom');
        fs.mkdirSync(degradedDirectory, { recursive: true });
        try {
          const degraded = await measureDegradedDomDocument(target.url, desktopConfig);
          if (!degraded) {
            throw new Error(`Degraded Lighthouse probe returned no result for ${target.url}`);
          }
          const degradedHtml = degraded.report;
          if (typeof degradedHtml === 'string') {
            fs.writeFileSync(path.join(degradedDirectory, 'index.html'), degradedHtml);
          }
          fs.writeFileSync(
            path.join(degradedDirectory, 'report.json'),
            JSON.stringify(degraded.lhr ?? {}, undefined, 2),
          );
          writeMeasurementModeMarker(degradedDirectory, 'degraded-dom', {
            reason: liveBlocker,
            satisfiesLiveGate: false,
          });
        } catch (degradedError) {
          const message =
            degradedError instanceof Error ? degradedError.message : String(degradedError);
          writeMeasurementModeMarker(degradedDirectory, 'degraded-dom', {
            reason: liveBlocker,
            satisfiesLiveGate: false,
            degradedError: message,
          });
        }

        throw new Error(
          `Live Lighthouse navigation gate failed for ${target.name}: ${liveBlocker}. Degraded DOM diagnostics were saved under degraded-dom/ and do not satisfy thresholds.`,
        );
      }

      if (profile.identityProbe === 'live-rendered') {
        const validationPage = await browser.newPage();
        try {
          const response = await validationPage.goto(target.url, {
            waitUntil: 'load',
            timeout: 60_000,
          });
          if (profile.renderedReadySelector) {
            await expect(validationPage.locator(profile.renderedReadySelector).first()).toBeVisible({
              timeout: 60_000,
            });
          }
          assertProbedLiveTargetDocument(profile, {
            finalUrl: validationPage.url(),
            status: response?.status() ?? 0,
            title: await validationPage.title(),
            html: await validationPage.content(),
          });
          await verifyEssentialAssets(validationPage.url(), profile);
        } finally {
          await validationPage.close();
        }
      } else {
        await assertLiveTargetDocument(target.url, profile, finalUrl);
      }

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
