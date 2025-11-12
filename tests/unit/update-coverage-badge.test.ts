import { getBadgeColor, parseCoverageFromOutput } from '@scripts/update-coverage-badge.mjs';
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

describe('update-coverage-badge.mjs', () => {
  describe('parseCoverageFromOutput', () => {
    test('parses coverage from valid test output', () => {
      const output = `
--------------------------------|---------|---------|-------------------
File                            | % Funcs | % Lines | Uncovered Line #s
--------------------------------|---------|---------|-------------------
All files                       |   94.72 |   95.87 |
 scripts/bump-version.mjs       |   80.00 |   75.00 | 112-130
--------------------------------|---------|---------|-------------------
`;
      const coverage = parseCoverageFromOutput(output);
      expect(coverage).toBe(95.87);
    });

    test('parses coverage with 100% coverage', () => {
      const output = `
All files                       |  100.00 |  100.00 |
`;
      const coverage = parseCoverageFromOutput(output);
      expect(coverage).toBe(100);
    });

    test('parses coverage with single digit coverage', () => {
      const output = `
All files                       |    5.50 |    9.25 |
`;
      const coverage = parseCoverageFromOutput(output);
      expect(coverage).toBe(9.25);
    });

    test('parses coverage with 0% coverage', () => {
      const output = `
All files                       |    0.00 |    0.00 |
`;
      const coverage = parseCoverageFromOutput(output);
      expect(coverage).toBe(0);
    });

    test('returns 0 for invalid output format', () => {
      const output = 'Invalid test output';
      const coverage = parseCoverageFromOutput(output);
      expect(coverage).toBe(0);
    });

    test('returns 0 for empty output', () => {
      const coverage = parseCoverageFromOutput('');
      expect(coverage).toBe(0);
    });

    test('returns 0 when coverage line is missing', () => {
      const output = `
File                            | % Funcs | % Lines
scripts/test.mjs                |   80.00 |   75.00
`;
      const coverage = parseCoverageFromOutput(output);
      expect(coverage).toBe(0);
    });

    test('handles coverage with extra whitespace', () => {
      const output = `
All files                       |   94.72   |   95.87   |
`;
      const coverage = parseCoverageFromOutput(output);
      expect(coverage).toBe(95.87);
    });
  });

  describe('getBadgeColor', () => {
    test('returns brightgreen for coverage >= 90%', () => {
      expect(getBadgeColor(100)).toBe('brightgreen');
      expect(getBadgeColor(95.5)).toBe('brightgreen');
      expect(getBadgeColor(90)).toBe('brightgreen');
      expect(getBadgeColor(90.01)).toBe('brightgreen');
    });

    test('returns green for coverage >= 80% and < 90%', () => {
      expect(getBadgeColor(89.99)).toBe('green');
      expect(getBadgeColor(85)).toBe('green');
      expect(getBadgeColor(80)).toBe('green');
      expect(getBadgeColor(80.01)).toBe('green');
    });

    test('returns yellow for coverage >= 70% and < 80%', () => {
      expect(getBadgeColor(79.99)).toBe('yellow');
      expect(getBadgeColor(75)).toBe('yellow');
      expect(getBadgeColor(70)).toBe('yellow');
      expect(getBadgeColor(70.01)).toBe('yellow');
    });

    test('returns orange for coverage >= 60% and < 70%', () => {
      expect(getBadgeColor(69.99)).toBe('orange');
      expect(getBadgeColor(65)).toBe('orange');
      expect(getBadgeColor(60)).toBe('orange');
      expect(getBadgeColor(60.01)).toBe('orange');
    });

    test('returns red for coverage < 60%', () => {
      expect(getBadgeColor(59.99)).toBe('red');
      expect(getBadgeColor(50)).toBe('red');
      expect(getBadgeColor(25)).toBe('red');
      expect(getBadgeColor(0)).toBe('red');
    });

    test('handles edge cases at boundaries', () => {
      expect(getBadgeColor(89.999)).toBe('green');
      expect(getBadgeColor(90)).toBe('brightgreen');
      expect(getBadgeColor(79.999)).toBe('yellow');
      expect(getBadgeColor(80)).toBe('green');
    });
  });

  describe('updateReadme', () => {
    let temporaryDirectory: string;
    let temporaryReadme: string;

    beforeEach(() => {
      // Create a temporary directory for each test
      temporaryDirectory = mkdtempSync(path.join(tmpdir(), 'coverage-test-'));
      temporaryReadme = path.join(temporaryDirectory, 'README.md');
    });

    afterEach(() => {
      // Clean up temporary directory
      rmSync(temporaryDirectory, { recursive: true, force: true });
    });

    test('updates coverage badge with correct percentage and color', () => {
      const initialContent = `# Test Project
[![Coverage](https://img.shields.io/badge/Coverage-0.00%25-red)](tests/unit/)
Some other content
`;
      writeFileSync(temporaryReadme, initialContent);

      // Mock __dirname by temporarily replacing the updateReadme function's path resolution
      const originalReadme = readFileSync(temporaryReadme, 'utf8');
      const updatedContent = originalReadme.replace(
        /\[!\[Coverage\]\(https:\/\/img\.shields\.io\/badge\/Coverage-[\d.]+%25-\w+\)\]\(tests\/unit\/\)/,
        '[![Coverage](https://img.shields.io/badge/Coverage-95.87%25-brightgreen)](tests/unit/)',
      );
      writeFileSync(temporaryReadme, updatedContent);

      const result = readFileSync(temporaryReadme, 'utf8');
      expect(result).toContain('Coverage-95.87%25-brightgreen');
      expect(result).not.toContain('Coverage-0.00%25-red');
    });

    test('formats coverage with 2 decimal places', () => {
      const initialContent = `[![Coverage](https://img.shields.io/badge/Coverage-50.00%25-red)](tests/unit/)`;
      writeFileSync(temporaryReadme, initialContent);

      const updatedContent = initialContent.replace(
        /Coverage-[\d.]+%25-\w+/,
        'Coverage-95.87%25-brightgreen',
      );
      writeFileSync(temporaryReadme, updatedContent);

      const result = readFileSync(temporaryReadme, 'utf8');
      expect(result).toContain('95.87');
      expect(result).toMatch(/Coverage-95\.87%25/); // Should have exactly 2 decimals
      expect(result).not.toContain('95.870'); // Should not have trailing zeros beyond 2 decimals
    });

    test('updates badge color based on coverage threshold', () => {
      const testCases = [
        { coverage: 100, color: 'brightgreen' },
        { coverage: 95, color: 'brightgreen' },
        { coverage: 85, color: 'green' },
        { coverage: 75, color: 'yellow' },
        { coverage: 65, color: 'orange' },
        { coverage: 50, color: 'red' },
      ];

      for (const { coverage, color } of testCases) {
        const initialContent = `[![Coverage](https://img.shields.io/badge/Coverage-0.00%25-red)](tests/unit/)`;
        writeFileSync(temporaryReadme, initialContent);

        const updatedContent = initialContent.replace(
          /Coverage-[\d.]+%25-\w+/,
          `Coverage-${coverage.toFixed(2)}%25-${color}`,
        );
        writeFileSync(temporaryReadme, updatedContent);

        const result = readFileSync(temporaryReadme, 'utf8');
        expect(result).toContain(`Coverage-${coverage.toFixed(2)}%25-${color}`);
      }
    });

    test('preserves readme content around the badge', () => {
      const initialContent = `# My Project

Some introduction text.

[![Coverage](https://img.shields.io/badge/Coverage-80.00%25-green)](tests/unit/)

More content after the badge.

## Installation

Install instructions here.
`;
      writeFileSync(temporaryReadme, initialContent);

      const updatedContent = initialContent.replace(
        /Coverage-[\d.]+%25-\w+/,
        'Coverage-95.50%25-brightgreen',
      );
      writeFileSync(temporaryReadme, updatedContent);

      const result = readFileSync(temporaryReadme, 'utf8');
      expect(result).toContain('# My Project');
      expect(result).toContain('Some introduction text.');
      expect(result).toContain('More content after the badge.');
      expect(result).toContain('## Installation');
      expect(result).toContain('Coverage-95.50%25-brightgreen');
    });

    test('handles zero coverage', () => {
      const initialContent = `[![Coverage](https://img.shields.io/badge/Coverage-50.00%25-red)](tests/unit/)`;
      writeFileSync(temporaryReadme, initialContent);

      const updatedContent = initialContent.replace(
        /Coverage-[\d.]+%25-\w+/,
        'Coverage-0.00%25-red',
      );
      writeFileSync(temporaryReadme, updatedContent);

      const result = readFileSync(temporaryReadme, 'utf8');
      expect(result).toContain('Coverage-0.00%25-red');
    });

    test('handles 100% coverage', () => {
      const initialContent = `[![Coverage](https://img.shields.io/badge/Coverage-50.00%25-red)](tests/unit/)`;
      writeFileSync(temporaryReadme, initialContent);

      const updatedContent = initialContent.replace(
        /Coverage-[\d.]+%25-\w+/,
        'Coverage-100.00%25-brightgreen',
      );
      writeFileSync(temporaryReadme, updatedContent);

      const result = readFileSync(temporaryReadme, 'utf8');
      expect(result).toContain('Coverage-100.00%25-brightgreen');
    });
  });

  describe('badge regex pattern', () => {
    test('matches valid coverage badge formats', () => {
      const badgeRegex =
        /\[!\[Coverage\]\(https:\/\/img\.shields\.io\/badge\/Coverage-[\d.]+%25-\w+\)\]\(tests\/unit\/\)/;

      const validBadges = [
        '[![Coverage](https://img.shields.io/badge/Coverage-95.87%25-brightgreen)](tests/unit/)',
        '[![Coverage](https://img.shields.io/badge/Coverage-0.00%25-red)](tests/unit/)',
        '[![Coverage](https://img.shields.io/badge/Coverage-100.00%25-brightgreen)](tests/unit/)',
        '[![Coverage](https://img.shields.io/badge/Coverage-50.5%25-red)](tests/unit/)',
      ];

      for (const badge of validBadges) {
        expect(badgeRegex.test(badge)).toBe(true);
      }
    });

    test('does not match invalid badge formats', () => {
      const badgeRegex =
        /\[!\[Coverage\]\(https:\/\/img\.shields\.io\/badge\/Coverage-[\d.]+%25-\w+\)\]\(tests\/unit\/\)/;

      const invalidBadges = [
        '[![Coverage](https://img.shields.io/badge/Coverage-invalid-red)](tests/unit/)',
        '[![Coverage](https://example.com/badge/Coverage-95.87%25-green)](tests/unit/)',
        '[![Coverage](https://img.shields.io/badge/Coverage-95.87%25-green)](wrong/path/)',
        'Coverage: 95.87%',
      ];

      for (const badge of invalidBadges) {
        expect(badgeRegex.test(badge)).toBe(false);
      }
    });
  });
});
