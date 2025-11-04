#!/usr/bin/env node
/* eslint-disable unicorn/import-style */

/**
 * Package.json version bumper based on Conventional Commits
 * Automatically bumps package.json version on commit:
 * - feat: minor (0.1.0 -> 0.2.0)
 * - fix: patch (0.1.0 -> 0.1.1)
 * - perf: patch (0.1.0 -> 0.1.1) - performance improvements
 * - refactor: patch (0.1.0 -> 0.1.1) - code refactoring
 * - BREAKING CHANGE or feat!: major (0.1.0 -> 1.0.0)
 * - Other types: no bump
 */

import { dirname, join } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';

import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '..', 'package.json');

try {
  // Get commit message from command line argument
  const commitMessage = process.argv[2] || '';

  if (!commitMessage.trim()) {
    console.log('⚠️  No commit message provided, skipping version bump');
    process.exit(0);
  }

  // Read package.json
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const currentVersion = packageJson.version;
  const [major, minor, patch] = currentVersion.split('.').map(Number);

  // Parse commit message
  const commitType = commitMessage.match(
    /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?(!)?:/,
  )?.[1];
  const isBreaking =
    commitMessage.includes('BREAKING CHANGE') ||
    commitMessage.includes('BREAKING:') ||
    commitMessage.match(/^(feat|fix|perf|refactor)(\(.+\))?!:/);

  let newVersion = currentVersion;

  if (isBreaking && commitType) {
    // Major version bump
    newVersion = `${major + 1}.0.0`;
    console.log(`🚀 BREAKING CHANGE detected: ${currentVersion} -> ${newVersion}`);
  } else if (commitType === 'feat') {
    // Minor version bump
    newVersion = `${major}.${minor + 1}.0`;
    console.log(`✨ Feature detected: ${currentVersion} -> ${newVersion}`);
  } else if (commitType === 'fix' || commitType === 'perf' || commitType === 'refactor') {
    // Patch version bump
    newVersion = `${major}.${minor}.${patch + 1}`;
    let emoji;
    let typeName;
    if (commitType === 'fix') {
      emoji = '🐛';
      typeName = 'Fix';
    } else if (commitType === 'perf') {
      emoji = '⚡';
      typeName = 'Performance';
    } else {
      emoji = '🔧';
      typeName = 'Refactor';
    }
    console.log(`${emoji} ${typeName} detected: ${currentVersion} -> ${newVersion}`);
  } else {
    console.log(
      `ℹ️  Commit type "${commitType}" does not trigger version bump (${currentVersion})`,
    );
    process.exit(0);
  }

  // Update package.json
  packageJson.version = newVersion;
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, undefined, 2) + '\n');

  // Output to stderr for display, stdout for script consumption
  if (isBreaking && commitType) {
    console.error(`🚀 BREAKING CHANGE detected: ${currentVersion} -> ${newVersion}`);
  } else {
    switch (commitType) {
      case 'feat': {
        console.error(`✨ Feature detected: ${currentVersion} -> ${newVersion}`);
        break;
      }
      case 'fix': {
        console.error(`🐛 Fix detected: ${currentVersion} -> ${newVersion}`);
        break;
      }
      case 'perf': {
        console.error(`⚡ Performance detected: ${currentVersion} -> ${newVersion}`);
        break;
      }
      case 'refactor': {
        console.error(`🔧 Refactor detected: ${currentVersion} -> ${newVersion}`);
        break;
      }
      default: {
        // No output for other types
        break;
      }
    }
  }

  // Output new version to stdout for use by other scripts
  process.stdout.write(newVersion);
} catch (error) {
  console.error('⚠️  Error bumping version:', error.message);
  // Don't fail the commit if version bumping fails
  process.exit(0);
}
