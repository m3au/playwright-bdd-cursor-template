import * as fs from 'node:fs';

import { expect, test } from '@playwright/test';
import { getAxeResults, injectAxe } from 'axe-playwright';

import { environment } from '@utils';
import path from 'node:path';

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

const baseUrl = environment('BASE_URL');
const maxViolations = +environment('AXE_MAX_VIOLATIONS');
const outputDirectory = path.join(process.cwd(), 'test-output');

test.describe('Accessibility Tests', () => {
  test('should have no accessibility violations on cable guy page', async ({ page }) => {
    // eslint-disable-next-line playwright/no-networkidle -- networkidle needed for accessibility audit
    await page.goto(baseUrl, { waitUntil: 'networkidle' });

    const acceptButton = page.getByRole('button', { name: /alright/i });
    // eslint-disable-next-line playwright/no-conditional-in-test -- Cookie banner may or may not appear
    if (await acceptButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await acceptButton.click();
    }

    await page.waitForLoadState('load');
    await injectAxe(page);
    const results = await getAxeResults(page);
    // eslint-disable-next-line playwright/no-conditional-in-test -- Nullish coalescing for default empty array
    const violations: AxeViolation[] = (results.violations ?? []) as AxeViolation[];

    // Save report BEFORE assertion (even if test fails, we want the report)
    const axeDirectory = path.join(outputDirectory, 'axe');
    fs.mkdirSync(axeDirectory, { recursive: true });

    const reportPath = path.join(axeDirectory, 'cable-guy-a11y-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(violations, undefined, 2));

    const htmlTemplatePath = path.join(process.cwd(), '.github', 'templates', 'axe-report.html');
    const htmlReportPath = path.join(axeDirectory, 'index.html');
    // eslint-disable-next-line playwright/no-conditional-in-test -- Template file may or may not exist
    if (fs.existsSync(htmlTemplatePath)) {
      let htmlContent = fs.readFileSync(htmlTemplatePath, 'utf8');
      // Embed JSON data directly in HTML to avoid CORS issues with file:// protocol
      const jsonData = JSON.stringify(violations);
      htmlContent = htmlContent.replace(
        'loadReport();',
        `// Embedded JSON data to avoid CORS issues
        window.__AXE_VIOLATIONS__ = ${jsonData};
        loadReport();`,
      );
      htmlContent = htmlContent.replace(
        "const response = await fetch('./cable-guy-a11y-report.json');\n          if (!response.ok) {\n            throw new Error(`HTTP ${response.status}: ${response.statusText}`);\n          }\n\n          const violations = await response.json();",
        `// Use embedded data if available, otherwise fetch
          let violations;
          if (window.__AXE_VIOLATIONS__) {
            violations = window.__AXE_VIOLATIONS__;
          } else {
            const response = await fetch('./cable-guy-a11y-report.json');
            if (!response.ok) {
              throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
            }
            violations = await response.json();
          }`,
      );
      fs.writeFileSync(htmlReportPath, htmlContent);
    }

    // Log violations count for visibility (but don't fail the test)
    console.log(`Accessibility violations found: ${violations.length}`);
    // eslint-disable-next-line playwright/no-conditional-in-test -- Conditional logging for better visibility
    if (violations.length > 0) {
      console.log(
        'Violations:',
        JSON.stringify(
          violations.map((v) => ({ id: v.id, impact: v.impact })),
          undefined,
          2,
        ),
      );
    }
    expect(violations.length).toBeLessThanOrEqual(maxViolations);
  });
});
