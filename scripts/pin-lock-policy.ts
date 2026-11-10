/* eslint-disable unicorn/prefer-set-has -- YAML fragments are substring scans, not Set membership */
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

export const ciWorkflowFile = '.github/workflows/ci.yml';

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
  if (commandIndex === -1) {
    return false;
  }
  const preceding = workflowContents.slice(Math.max(0, commandIndex - 400), commandIndex);
  const maskedPatterns = new Set(['continue-on-error: true', '|| true']);
  for (const pattern of maskedPatterns) {
    if (preceding.includes(pattern)) {
      return false;
    }
  }
  return true;
}

const auditCommands = ['bun run lighthouse', 'bun run axe', 'bun run test:performance'] as const;

export function ciWorkflowMasksAuditJobs(workflowContents: string): boolean {
  const auditJobs = ['lighthouse:', 'axe:', 'performance:'];
  for (const jobName of auditJobs) {
    const jobIndex = workflowContents.indexOf(`  ${jobName}`);
    if (jobIndex === -1) {
      continue;
    }
    const maskedPatterns = new Set(['continue-on-error: true', '|| true']);
    const jobBlock = workflowContents.slice(jobIndex, jobIndex + 800);
    for (const pattern of maskedPatterns) {
      if (jobBlock.includes(pattern)) {
        return true;
      }
    }
  }
  return false;
}

export function auditRunStepsMaskFailures(workflowContents: string): boolean {
  for (const command of auditCommands) {
    const needle = `run: ${command}`;
    let searchFrom = 0;
    let commandIndex = workflowContents.indexOf(needle, searchFrom);
    while (commandIndex !== -1) {
      const segment = workflowContents.slice(
        Math.max(0, commandIndex - 400),
        commandIndex + needle.length + 200,
      );
      const maskedPatterns = new Set(['continue-on-error: true', '|| true']);
      for (const pattern of maskedPatterns) {
        if (segment.includes(pattern)) {
          return true;
        }
      }
      searchFrom = commandIndex + needle.length;
      commandIndex = workflowContents.indexOf(needle, searchFrom);
    }
  }
  return false;
}

const isDirectRun = import.meta.main === true;

if (isDirectRun) {
  const parameters = process.argv.slice(2);
  if (parameters[0] === '--steps') {
    process.stdout.write(`${dependabotPinWorkflowSteps.join('\n')}\n`);
  }
}
