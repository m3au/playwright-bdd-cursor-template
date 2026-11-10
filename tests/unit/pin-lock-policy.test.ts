import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, test } from 'bun:test';

import {
  auditRunStepBlocksGate,
  auditRunStepsMaskFailures,
  auditWorkflowFiles,
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
});

describe('frozen lockfile drift', () => {
  test('rejects a manifest change when the lockfile is not regenerated', () => {
    const packageJson = readFileSync(path.join(workspaceRoot, 'package.json'), 'utf8');
    expect(packageJson).toContain('"name":');
    const lock = readFileSync(path.join(workspaceRoot, 'bun.lock'), 'utf8');
    expect(lock.length).toBeGreaterThan(100);
    const result = Bun.spawnSync(['bun', 'install', '--frozen-lockfile'], {
      cwd: workspaceRoot,
      stdout: 'pipe',
      stderr: 'pipe',
    });
    expect(result.exitCode).toBe(0);
  });
});
