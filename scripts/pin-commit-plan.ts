/**
 * Decide whether the Dependabot pin job should create a commit.
 * Lockfile-only rewrites are discarded. A package.json change commits both
 * package.json and bun.lock so the lock matches the pinned versions.
 */
export function decidePinCommit(changedPaths: readonly string[]): {
  action: 'none' | 'commit';
  paths: readonly string[];
} {
  if (!changedPaths.includes('package.json')) {
    return { action: 'none', paths: [] };
  }

  return { action: 'commit', paths: ['package.json', 'bun.lock'] };
}

/** Push spec that works from a detached checkout of a pull request head. */
export function pinnedVersionsPushReference(headReference?: string): string {
  if (!headReference || headReference.trim().length === 0 || /\s/.test(headReference)) {
    throw new Error('A pull request head ref is required to push pinned versions');
  }
  return `HEAD:${headReference}`;
}

const isDirectRun = import.meta.main === true;

if (isDirectRun) {
  const parameters = process.argv.slice(2);
  if (parameters[0] === '--push-ref') {
    process.stdout.write(`${pinnedVersionsPushReference(parameters[1])}\n`);
  } else {
    const decision = decidePinCommit(parameters.filter((path) => path.length > 0));
    process.stdout.write(`${decision.action}\n`);
  }
}
