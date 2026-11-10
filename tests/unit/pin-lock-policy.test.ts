import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';

import { describe, expect, test } from 'bun:test';

import {
  auditRunStepBlocksGate,
  auditRunStepsMaskFailures,
  auditWorkflowFiles,
  ciWorkflowFile,
  ciWorkflowMasksAuditJobs,
  dependabotPinWorkflowSteps,
} from '../../scripts/pin-lock-policy';

const workspaceRoot = path.join(import.meta.dir, '..', '..');

describe('dependabot pin lock policy', () => {
  test('workflow regenerates and frozen-checks the lockfile after pin', () => {
    const dependabotWorkflow = readFileSync(
      path.join(workspaceRoot, '.github/workflows/dependabot.yml'),
      'utf8',
    );
    for (const step of dependabotPinWorkflowSteps) {
      expect(dependabotWorkflow).toContain(step);
    }
    const pinIndex = dependabotWorkflow.indexOf('bun run pin');
    const installIndex = dependabotWorkflow.indexOf('bun install\n', pinIndex);
    const frozenIndex = dependabotWorkflow.indexOf('bun install --frozen-lockfile', installIndex);
    expect(pinIndex).toBeGreaterThan(-1);
    expect(installIndex).toBeGreaterThan(pinIndex);
    expect(frozenIndex).toBeGreaterThan(installIndex);
    expect(dependabotWorkflow).toContain('git checkout -- bun.lock');
    expect(dependabotWorkflow).toContain('permissions:\n      contents: write');
  });
});

describe('audit workflow gates', () => {
  for (const workflowFile of auditWorkflowFiles) {
    test(`${workflowFile} fails the job when the audit command fails`, () => {
      const contents = readFileSync(path.join(workspaceRoot, workflowFile), 'utf8');
      expect(auditRunStepBlocksGate(contents, workflowFile)).toBe(true);
      expect(auditRunStepsMaskFailures(contents)).toBe(false);
    });
  }

  test(`${ciWorkflowFile} does not mask audit jobs with continue-on-error`, () => {
    const contents = readFileSync(path.join(workspaceRoot, ciWorkflowFile), 'utf8');
    expect(ciWorkflowMasksAuditJobs(contents)).toBe(false);
  });
});

describe('frozen lockfile drift', () => {
  test('passes when manifest and lockfile are consistent', () => {
    const result = Bun.spawnSync(['bun', 'install', '--frozen-lockfile'], {
      cwd: workspaceRoot,
      stdout: 'pipe',
      stderr: 'pipe',
    });
    expect(result.exitCode).toBe(0);
  });

  test('fails when package.json changes without a lockfile refresh', () => {
    const tempDir = mkdtempSync(path.join(tmpdir(), 'pin-lock-drift-'));
    const packageJsonPath = path.join(workspaceRoot, 'package.json');
  const lockPath = path.join(workspaceRoot, 'bun.lock');
    writeFileSync(path.join(tempDir, 'package.json'), readFileSync(packageJsonPath, 'utf8'));
    writeFileSync(path.join(tempDir, 'bun.lock'), readFileSync(lockPath, 'utf8'));

    const parsed = JSON.parse(readFileSync(path.join(tempDir, 'package.json'), 'utf8')) as {
      devDependencies?: Record<string, string>;
    };
    parsed.devDependencies = {
      ...parsed.devDependencies,
      'totally-fake-package-drift-test': '1.0.0',
    };
    writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(parsed, undefined, 2));

    const result = Bun.spawnSync(['bun', 'install', '--frozen-lockfile'], {
      cwd: tempDir,
      stdout: 'pipe',
      stderr: 'pipe',
    });
    expect(result.exitCode).not.toBe(0);
  });
});
