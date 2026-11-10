import { describe, expect, test } from 'bun:test';

import { decidePinCommit, pinnedVersionsPushReference } from '../../scripts/pin-commit-plan';

describe('decidePinCommit', () => {
  test('does not commit when nothing changed', () => {
    expect(decidePinCommit([])).toEqual({ action: 'none', paths: [] });
  });

  test('does not commit a lockfile-only rewrite', () => {
    expect(decidePinCommit(['bun.lock'])).toEqual({ action: 'none', paths: [] });
  });

  test('commits package.json and bun.lock when package.json changed alone', () => {
    expect(decidePinCommit(['package.json'])).toEqual({
      action: 'commit',
      paths: ['package.json', 'bun.lock'],
    });
  });

  test('commits package.json and bun.lock when both changed', () => {
    expect(decidePinCommit(['bun.lock', 'package.json'])).toEqual({
      action: 'commit',
      paths: ['package.json', 'bun.lock'],
    });
  });

  test('does not stage unrelated paths when package.json also changed', () => {
    expect(
      decidePinCommit(['README.md', 'package.json', 'tests/unit/pin-commit-plan.test.ts']),
    ).toEqual({
      action: 'commit',
      paths: ['package.json', 'bun.lock'],
    });
  });

  test('ignores unrelated paths when the manifest did not change', () => {
    expect(decidePinCommit(['README.md', 'bun.lock'])).toEqual({ action: 'none', paths: [] });
  });

  test('pushes HEAD to the pull request branch from a detached checkout', () => {
    expect(pinnedVersionsPushReference('dependabot/npm_and_yarn/dev-dependencies-e3b911ab16')).toBe(
      'HEAD:dependabot/npm_and_yarn/dev-dependencies-e3b911ab16',
    );
  });

  test('refuses to push when the head ref is missing', () => {
    expect(() => pinnedVersionsPushReference()).toThrow('pull request head ref');
    expect(() => pinnedVersionsPushReference('')).toThrow('pull request head ref');
  });
});
