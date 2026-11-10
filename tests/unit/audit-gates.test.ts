import { describe, expect, test } from 'bun:test';

import { gatePolicyForTarget, targetGatePolicies } from '../audit/audit-gates';
import { lighthouseCategoriesForTarget } from '../audit/target-profiles';

describe('target gate policies', () => {
  test('keeps polymer on the full Lighthouse category gate set', () => {
    expect(lighthouseCategoriesForTarget('polymer-shop')).toEqual([
      'performance',
      'accessibility',
      'best-practices',
      'seo',
    ]);
  });

  test('does not gate Lighthouse performance on self-hosted W3C targets', () => {
    expect(targetGatePolicies['w3c-bad']?.lighthouseCategories).toEqual([]);
    expect(targetGatePolicies['w3c-after']?.lighthouseCategories).toEqual([]);
    expect(targetGatePolicies['w3c-bad']?.axeViolationGate).toBe(true);
  });

  test('refuses empty gate policies', () => {
    expect(() => gatePolicyForTarget('gate-policy-empty-fixture')).toThrow(/would gate nothing/);
  });
});
