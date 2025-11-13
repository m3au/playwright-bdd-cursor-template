import * as fs from 'node:fs';
import path from 'node:path';

import { expect, test } from '@playwright/test';
import { getAxeResults, injectAxe } from 'axe-playwright';

import { environment } from '@utils';

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
}

const axeTargets: AxeTarget[] = [
  { name: 'w3c-bad', url: environment('BASE_URL_AXE_W3C_BAD')! },
  { name: 'w3c-after', url: environment('BASE_URL_AXE_W3C_AFTER')! },
  { name: 'deque-mars', url: environment('BASE_URL_AXE_DEQUE_MARS')! },
];

const maxViolations = +environment('AXE_MAX_VIOLATIONS')!;
const outputDirectory = path.join(process.cwd(), 'test-output');
const axeDirectory = path.join(outputDirectory, 'axe');
const htmlTemplatePath = path.join(process.cwd(), '.github', 'templates', 'axe-report.html');

const processedTargets: { name: string; directory: string; url: string }[] = [];

fs.mkdirSync(axeDirectory, { recursive: true });

test.describe.configure({ mode: 'serial' });

function sanitizeName(name: string): string {
  const segments = name.toLowerCase().match(/[a-z0-9]+/g);
  return segments?.join('-') ?? 'target';
}

function writeSummary(): void {
  const summaryPath = path.join(axeDirectory, 'index.html');
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
    <title>Axe Accessibility Audits</title>
    <style>
      body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 3rem 1.5rem; }
      .container { max-width: 960px; margin: 0 auto; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(18px); border-radius: 16px; padding: 2.5rem; box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.8); }
      h1 { margin-top: 0; font-size: 2rem; }
      p { color: #94a3b8; line-height: 1.6; }
      ul { list-style: none; margin: 2rem 0 0; padding: 0; display: grid; gap: 1rem; }
      li { background: rgba(30, 41, 59, 0.9); border-radius: 12px; padding: 1rem 1.25rem; border: 1px solid rgba(148, 163, 184, 0.2); transition: transform 0.2s ease, border-color 0.2s ease; }
      li:hover { transform: translateY(-3px); border-color: #38bdf8; }
      a { color: #38bdf8; text-decoration: none; font-weight: 600; }
      a:hover { text-decoration: underline; }
      small { color: #64748b; }
      .note { margin-top: 2rem; font-size: 0.875rem; color: #cbd5f5; }
      code { background: rgba(30, 41, 59, 0.7); padding: 0.1rem 0.4rem; border-radius: 4px; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>♿ Axe Accessibility Audits</h1>
      <p>
        These reports are generated with intentionally strict thresholds (<code>AXE_MAX_VIOLATIONS=${maxViolations}</code>)
        so they are expected to fail. CI keeps running to ensure the results are still collected and published.
      </p>
      <ul>
        ${listItems}
      </ul>
      <p class="note">
        Each link opens a standalone accessibility report with embedded JSON data so it can be viewed offline.
      </p>
    </div>
  </body>
</html>`;

  fs.writeFileSync(summaryPath, summaryHtml);
}

for (const target of axeTargets) {
  test(`accessibility audit – ${target.name}`, async ({ page }) => {
    // eslint-disable-next-line playwright/no-networkidle -- networkidle ensures external assets settle before audit
    await page.goto(target.url, { waitUntil: 'networkidle' });

    // Attempt to dismiss simple cookie banners if they appear
    const acceptButton = page.getByRole('button', { name: /accept|agree|alright|okay/i });
    if (await acceptButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await acceptButton.click();
    }

    await page.waitForLoadState('load');
    await injectAxe(page);
    const results = await getAxeResults(page);
    const violations: AxeViolation[] = (results.violations ?? []) as AxeViolation[];

    const safeName = sanitizeName(target.name);
    const targetDirectory = path.join(axeDirectory, safeName);
    fs.mkdirSync(targetDirectory, { recursive: true });

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
      htmlContent = htmlContent.replaceAll(
        '<h1>♿ Axe Accessibility Report</h1>',
        `<h1>♿ Axe Accessibility Report – ${target.name}</h1>`,
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
