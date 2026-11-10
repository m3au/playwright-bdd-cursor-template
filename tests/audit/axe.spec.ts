import * as fs from 'node:fs';
import path from 'node:path';

import { expect, test, type Page } from '@playwright/test';
import { getAxeResults, injectAxe } from 'axe-playwright';

import { environment, sanitizeTestName } from '@utils';

import { getSharedStyles, themes } from '../../scripts/template-utils';

import {
  assertProbedLiveTargetDocument,
  degradedMeasurementBannerHtml,
  verifyEssentialAssetsWithRequest,
  writeMeasurementModeMarker,
} from './measurement';
import { profileForTargetName } from './target-profiles';

/* eslint-disable playwright/no-conditional-in-test -- Accessibility audits require guard clauses for optional UI state and assets */

interface AxeViolationNode {
  target?: string[];
  html?: string;
}

interface AxeViolation {
  id?: string;
  impact?: string;
  description?: string;
  help?: string;
  nodes?: AxeViolationNode[];
}

interface AxeTarget {
  name: string;
  url: string;
  description?: string;
}

const axeTargets: AxeTarget[] = [
  {
    name: 'w3c-bad',
    url: environment('BASE_URL_AXE_W3C_BAD')!,
    description: 'W3C Before Fix Demo – Demonstrates accessibility issues that need fixing',
  },
  {
    name: 'w3c-after',
    url: environment('BASE_URL_AXE_W3C_AFTER')!,
    description:
      'W3C After Fix Demo – Shows improved accessibility (may still have issues as it tests more elements)',
  },
  {
    name: 'deque-mars',
    url: environment('BASE_URL_AXE_DEQUE_MARS')!,
    description: 'Deque University Mars Demo – Educational accessibility testing site',
  },
];

const maxViolations = +environment('AXE_MAX_VIOLATIONS')!;
const outputDirectory = path.join(process.cwd(), 'test-output');
const axeDirectory = path.join(outputDirectory, 'axe');
const htmlTemplatePath = path.join(process.cwd(), '.github', 'templates', 'axe-report.html');

const processedTargets: { name: string; directory: string; url: string }[] = [];

fs.mkdirSync(axeDirectory, { recursive: true });

test.describe.configure({ mode: 'serial' });

function writeSummary(): void {
  const summaryPath = path.join(axeDirectory, 'index.html');
  const templatePath = path.join(process.cwd(), '.github', 'templates', 'axe-summary.html');

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }

  let html = fs.readFileSync(templatePath, 'utf8');

  const listItems = processedTargets
    .map((target) => {
      const targetInfo = axeTargets.find((t) => t.name === target.name);
      const description = targetInfo?.description
        ? `<div class="target-description">${targetInfo.description} – <a href="${target.url}" class="target-url" target="_blank" rel="noopener noreferrer">${target.url}</a></div>`
        : `<div class="target-description"><a href="${target.url}" class="target-url" target="_blank" rel="noopener noreferrer">${target.url}</a></div>`;
      return `<li>
        <a href="./${target.directory}/index.html" class="target-link">${target.name}</a>
        ${description}
      </li>`;
    })
    .join('\n');

  // eslint-disable-next-line no-secrets/no-secrets -- False positive: environment variable name in HTML template
  const descriptionHtml = `
      <p>
        These reports enforce a maximum of <code>AXE_MAX_VIOLATIONS=${maxViolations}</code> violations
        on <strong>live navigation only</strong>. Intercepted or prefetched substitutes cannot satisfy this gate.
      </p>`;

  const notesHtml = `
      <p class="note">
        Each link opens a standalone accessibility report with embedded JSON data so it can be viewed offline.
      </p>
      <p class="note" style="margin-top: 1rem;">
        <strong>Note:</strong> The "w3c-after" demo may show more violations than "w3c-bad" because it tests a more complex page structure with additional elements and features, demonstrating that fixing one set of issues can reveal others or require testing more comprehensive scenarios.
      </p>`;

  const sharedStyles = getSharedStyles(themes.axe);
  const degradedBanner = degradedMeasurementBannerHtml(
    axeDirectory,
    processedTargets.map((target) => target.directory),
  );

  html = html.replaceAll('{{SHARED_STYLES}}', sharedStyles);
  html = html.replaceAll('{{DESCRIPTION}}', descriptionHtml + degradedBanner);
  html = html.replaceAll('{{LIST_ITEMS}}', listItems);
  html = html.replaceAll('{{NOTES}}', notesHtml);

  fs.writeFileSync(summaryPath, html);
}

async function openLiveAuditDocument(page: Page, url: string, targetName: string): Promise<void> {
  const profile = profileForTargetName(targetName);
  const response = await page.goto(url, { waitUntil: 'load', timeout: 60_000 });
  const status = response?.status() ?? 0;
  const finalUrl = page.url();

  if (status >= 400) {
    throw new Error(
      `Axe live navigation to ${url} failed with HTTP ${String(status)} (final ${finalUrl}).`,
    );
  }

  console.log(`Axe live navigation final URL for ${targetName}: ${finalUrl}`);

  if (profile.renderedReadySelector) {
    await expect(page.locator(profile.renderedReadySelector).first()).toBeVisible({
      timeout: 60_000,
    });
  }

  const title = await page.title();
  const html = await page.content();

  assertProbedLiveTargetDocument(profile, {
    finalUrl,
    status,
    title,
    html,
  });

  await verifyEssentialAssetsWithRequest(page.request, finalUrl, profile);
}

for (const target of axeTargets) {
  test(`accessibility audit – ${target.name}`, async ({ page }) => {
    await openLiveAuditDocument(page, target.url, target.name);
    await expect(page.locator('body')).toBeVisible();

    const acceptButton = page.getByRole('button', { name: /accept|agree|alright|okay/i });
    if (await acceptButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await acceptButton.click();
    }

    await page.waitForLoadState('load');
    await injectAxe(page);
    const results = await getAxeResults(page);
    const violations: AxeViolation[] = (results.violations ?? []) as AxeViolation[];

    const safeName = sanitizeTestName(target.name);
    const targetDirectory = path.join(axeDirectory, safeName);
    fs.mkdirSync(targetDirectory, { recursive: true });

    writeMeasurementModeMarker(targetDirectory, 'live', {
      seedUrl: target.url,
      finalUrl: page.url(),
      satisfiesLiveGate: true,
    });

    const jsonFileName = `${safeName}-axe-report.json`;
    const jsonReportPath = path.join(targetDirectory, jsonFileName);
    fs.writeFileSync(jsonReportPath, JSON.stringify(violations, undefined, 2));

    if (fs.existsSync(htmlTemplatePath)) {
      let htmlContent = fs.readFileSync(htmlTemplatePath, 'utf8');
      htmlContent = htmlContent.replaceAll('./cable-guy-a11y-report.json', `./${jsonFileName}`);
      htmlContent = htmlContent.replaceAll(
        '<title>Axe Accessibility Report</title>',
        `<title>Axe Accessibility Report – ${target.name}</title>`,
      );
      const titleHtml = target.description
        ? `<h1>♿ Axe Accessibility Report – ${target.name}</h1>
        <p class="target-description">${target.description}</p>
        <p class="target-url"><strong>Audited URL:</strong> <a href="${target.url}" target="_blank" rel="noopener noreferrer">${target.url}</a></p>`
        : `<h1>♿ Axe Accessibility Report – ${target.name}</h1>
        <p class="target-url"><strong>Audited URL:</strong> <a href="${target.url}" target="_blank" rel="noopener noreferrer">${target.url}</a></p>`;
      htmlContent = htmlContent.replaceAll(
        '<h1>♿ Axe Accessibility Report</h1>\n        <p>Automated accessibility testing using axe-core engine</p>',
        titleHtml,
      );
      fs.writeFileSync(path.join(targetDirectory, 'index.html'), htmlContent);
    }

    processedTargets.push({ name: target.name, directory: safeName, url: target.url });
    writeSummary();

    console.log(`Accessibility violations found for ${target.name}: ${violations.length}`);
    if (violations.length > 0) {
      console.log(
        'Violations:',
        JSON.stringify(
          violations.map((violation) => ({ id: violation.id, impact: violation.impact })),
          undefined,
          2,
        ),
      );
    }

    expect(violations.length).toBeLessThanOrEqual(maxViolations);
  });
}
