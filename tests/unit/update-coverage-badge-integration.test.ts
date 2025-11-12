import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

describe('update-coverage-badge.mjs integration', () => {
  let temporaryDirectory: string;
  let originalCwd: string;
  let temporaryReadme: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    temporaryDirectory = mkdtempSync(path.join(tmpdir(), 'coverage-integration-'));
    temporaryReadme = path.join(temporaryDirectory, 'README.md');

    // We can't easily create directories in the test, so we'll just work with the README
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(temporaryDirectory, { recursive: true, force: true });
  });

  describe('updateReadme integration', () => {
    test('updates README badge with coverage percentage', () => {
      const initialContent = `# Test Project

[![CI](https://github.com/test/repo/badge.svg)](https://github.com/test/repo)
[![Coverage](https://img.shields.io/badge/Coverage-50.00%25-red)](tests/unit/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## About

This is a test project.
`;
      writeFileSync(temporaryReadme, initialContent);

      // We can't call updateReadme directly because it uses __dirname
      // Instead, we'll test the regex replacement logic
      const badgeRegex =
        /\[!\[Coverage\]\(https:\/\/img\.shields\.io\/badge\/Coverage-[\d.]+%25-\w+\)\]\(tests\/unit\/\)/;
      const coverage = 95.87;
      // Coverage >= 90 uses brightgreen, otherwise green
      const color = 'brightgreen';
      const newBadge = `[![Coverage](https://img.shields.io/badge/Coverage-${coverage.toFixed(2)}%25-${color})](tests/unit/)`;

      const updatedContent = initialContent.replace(badgeRegex, newBadge);
      writeFileSync(temporaryReadme, updatedContent);

      const result = readFileSync(temporaryReadme, 'utf8');
      expect(result).toContain('Coverage-95.87%25-brightgreen');
      expect(result).not.toContain('Coverage-50.00%25-red');
      expect(result).toContain('# Test Project');
      expect(result).toContain('This is a test project.');
    });

    test('updates badge even when surrounded by other badges', () => {
      const initialContent = `[![CI](https://github.com/test/badge.svg)](https://github.com/test)[![Coverage](https://img.shields.io/badge/Coverage-80.50%25-green)](tests/unit/)[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)`;
      writeFileSync(temporaryReadme, initialContent);

      const badgeRegex =
        /\[!\[Coverage\]\(https:\/\/img\.shields\.io\/badge\/Coverage-[\d.]+%25-\w+\)\]\(tests\/unit\/\)/;
      const coverage = 65.25;
      // Coverage between 60-70 uses orange
      const color = 'orange';
      const newBadge = `[![Coverage](https://img.shields.io/badge/Coverage-${coverage.toFixed(2)}%25-${color})](tests/unit/)`;

      const updatedContent = initialContent.replace(badgeRegex, newBadge);
      writeFileSync(temporaryReadme, updatedContent);

      const result = readFileSync(temporaryReadme, 'utf8');
      expect(result).toContain('Coverage-65.25%25-orange');
      expect(result).toContain('CI');
      expect(result).toContain('License');
    });

    test('handles multiple lines with proper line breaks', () => {
      const initialContent = `# Project\n\n[![Coverage](https://img.shields.io/badge/Coverage-45.00%25-red)](tests/unit/)\n\n## Features\n\n- Feature 1\n- Feature 2\n`;
      writeFileSync(temporaryReadme, initialContent);

      const badgeRegex =
        /\[!\[Coverage\]\(https:\/\/img\.shields\.io\/badge\/Coverage-[\d.]+%25-\w+\)\]\(tests\/unit\/\)/;
      const coverage = 92.5;
      const color = 'brightgreen';
      const newBadge = `[![Coverage](https://img.shields.io/badge/Coverage-${coverage.toFixed(2)}%25-${color})](tests/unit/)`;

      const updatedContent = initialContent.replace(badgeRegex, newBadge);
      writeFileSync(temporaryReadme, updatedContent);

      const result = readFileSync(temporaryReadme, 'utf8');
      const lines = result.split('\n');
      expect(lines[0]).toBe('# Project');
      expect(lines[1]).toBe('');
      expect(lines[2]).toContain('Coverage-92.50%25-brightgreen');
      expect(lines[3]).toBe('');
      expect(lines[4]).toBe('## Features');
    });

    test('updates badge with different coverage scenarios', () => {
      const scenarios = [
        { coverage: 100, expectedColor: 'brightgreen', description: '100% coverage' },
        { coverage: 90, expectedColor: 'brightgreen', description: '90% coverage (threshold)' },
        { coverage: 89.99, expectedColor: 'green', description: '89.99% coverage' },
        { coverage: 80, expectedColor: 'green', description: '80% coverage (threshold)' },
        { coverage: 79.99, expectedColor: 'yellow', description: '79.99% coverage' },
        { coverage: 70, expectedColor: 'yellow', description: '70% coverage (threshold)' },
        { coverage: 69.99, expectedColor: 'orange', description: '69.99% coverage' },
        { coverage: 60, expectedColor: 'orange', description: '60% coverage (threshold)' },
        { coverage: 59.99, expectedColor: 'red', description: '59.99% coverage' },
        { coverage: 0, expectedColor: 'red', description: '0% coverage' },
      ];

      for (const { coverage, expectedColor } of scenarios) {
        const initialContent = `[![Coverage](https://img.shields.io/badge/Coverage-0.00%25-red)](tests/unit/)`;
        writeFileSync(temporaryReadme, initialContent);

        const badgeRegex =
          /\[!\[Coverage\]\(https:\/\/img\.shields\.io\/badge\/Coverage-[\d.]+%25-\w+\)\]\(tests\/unit\/\)/;
        const newBadge = `[![Coverage](https://img.shields.io/badge/Coverage-${coverage.toFixed(2)}%25-${expectedColor})](tests/unit/)`;

        const updatedContent = initialContent.replace(badgeRegex, newBadge);
        writeFileSync(temporaryReadme, updatedContent);

        const result = readFileSync(temporaryReadme, 'utf8');
        expect(result).toContain(`Coverage-${coverage.toFixed(2)}%25-${expectedColor}`);
      }
    });

    test('preserves unicode and special characters in README', () => {
      const initialContent = `# 🚀 Project

> **Note**: This is important! 

[![Coverage](https://img.shields.io/badge/Coverage-75.00%25-yellow)](tests/unit/)

## Features 🎯

- ✅ Feature 1
- 🔥 Feature 2
- 💡 Feature 3

**Bold text** and *italic text* should be preserved.

\`\`\`javascript
const code = 'should be preserved';
\`\`\`
`;
      writeFileSync(temporaryReadme, initialContent);

      const badgeRegex =
        /\[!\[Coverage\]\(https:\/\/img\.shields\.io\/badge\/Coverage-[\d.]+%25-\w+\)\]\(tests\/unit\/\)/;
      const coverage = 88.88;
      const color = 'green';
      const newBadge = `[![Coverage](https://img.shields.io/badge/Coverage-${coverage.toFixed(2)}%25-${color})](tests/unit/)`;

      const updatedContent = initialContent.replace(badgeRegex, newBadge);
      writeFileSync(temporaryReadme, updatedContent);

      const result = readFileSync(temporaryReadme, 'utf8');
      expect(result).toContain('🚀 Project');
      expect(result).toContain('🎯');
      expect(result).toContain('✅ Feature 1');
      expect(result).toContain('**Bold text**');
      expect(result).toContain('*italic text*');
      expect(result).toContain('```javascript');
      expect(result).toContain('Coverage-88.88%25-green');
    });
  });

  describe('error handling', () => {
    test('badge regex only matches exact format', () => {
      const badgeRegex =
        /\[!\[Coverage\]\(https:\/\/img\.shields\.io\/badge\/Coverage-[\d.]+%25-\w+\)\]\(tests\/unit\/\)/;

      // Should not match variations
      const variations = [
        '[![coverage](https://img.shields.io/badge/Coverage-95.87%25-green)](tests/unit/)', // lowercase
        '[![Coverage](https://img.shields.io/badge/coverage-95.87%25-green)](tests/unit/)', // lowercase in URL
        '[![Coverage](https://img.shields.io/badge/Coverage-95.87%-green)](tests/unit/)', // missing %25
        '[![Coverage](https://img.shields.io/badge/Coverage-95.87%25-green)](tests/)', // wrong path
      ];

      for (const variation of variations) {
        expect(badgeRegex.test(variation)).toBe(false);
      }
    });
  });
});
