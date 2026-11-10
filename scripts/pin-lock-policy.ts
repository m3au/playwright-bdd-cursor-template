/**
 * Workflow expectations for the Dependabot pin job and audit gates.
 */
export const dependabotPinWorkflowSteps = [
  'bun run pin',
  'bun install',
  'bun install --frozen-lockfile',
] as const;

export const auditWorkflowFiles = [
  '.github/workflows/lighthouse.yml',
  '.github/workflows/axe.yml',
  '.github/workflows/performance.yml',
] as const;

export function auditRunStepBlocksGate(workflowContents: string, workflowFile: string): boolean {
  const commandByFile: Record<string, string> = {
    '.github/workflows/lighthouse.yml': 'bun run lighthouse',
    '.github/workflows/axe.yml': 'bun run axe',
    '.github/workflows/performance.yml': 'bun run test:performance',
  };
  const command = commandByFile[workflowFile];
  if (!command) {
    return false;
  }
  const commandIndex = workflowContents.indexOf(`run: ${command}`);
  if (commandIndex < 0) {
    return false;
  }
  const preceding = workflowContents.slice(Math.max(0, commandIndex - 400), commandIndex);
  return !preceding.includes('continue-on-error: true') && !/\|\|\s*true/.test(preceding);
}

export function auditRunStepsMaskFailures(workflowContents: string): boolean {
  if (workflowContents.includes('continue-on-error: true')) {
    const segments = workflowContents.split(/^  \S+:/m);
    for (const segment of segments) {
      if (
        segment.includes('run: bun run lighthouse') ||
        segment.includes('run: bun run axe') ||
        segment.includes('run: bun run test:performance')
      ) {
        if (segment.includes('continue-on-error: true') || /\|\|\s*true/.test(segment)) {
          return true;
        }
      }
    }
  }
  return /\n\s+run: bun run (lighthouse|axe|test:performance).*\|\|\s*true/m.test(
    workflowContents,
  );
}

const isDirectRun = import.meta.main === true;

if (isDirectRun) {
  const parameters = process.argv.slice(2);
  if (parameters[0] === '--steps') {
    process.stdout.write(`${dependabotPinWorkflowSteps.join('\n')}\n`);
  }
}
