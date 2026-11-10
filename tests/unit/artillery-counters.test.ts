// cspell:ignore vusers
import { readFileSync } from 'node:fs';

import { describe, expect, test } from 'bun:test';

import { requestsFromArtilleryCounters } from '../performance/utils/artillery-runner';

describe('ReqRes Artillery counters', () => {
  test('zero completed work stays zero when only failures are recorded', () => {
    const requests = requestsFromArtilleryCounters({
      'vusers.created': 1,
      'vusers.failed': 1,
      'errors.Failed to fetch users page 2: 404': 1,
    });
    expect(requests.completed).toBe(0);
    expect(requests.failed).toBe(1);
  });

  test('maps vusers.completed to the nonzero work count', () => {
    const requests = requestsFromArtilleryCounters({
      'vusers.completed': 1,
      'vusers.failed': 0,
    });
    expect(requests.completed).toBe(1);
    expect(requests.failed).toBe(0);
  });

  test('requests /api/users on the origin and does not use the BDD world key', () => {
    const pagination = readFileSync(
      'tests/performance/challenges/reqres/processors/pagination-processor.cjs',
      'utf8',
    );
    const auth = readFileSync(
      'tests/performance/challenges/reqres/processors/auth-processor.cjs',
      'utf8',
    );
    const paginationConfig = readFileSync(
      'tests/performance/challenges/reqres/config/pagination-load.yml',
      'utf8',
    );
    const authConfig = readFileSync(
      'tests/performance/challenges/reqres/config/authenticated-load.yml',
      'utf8',
    );

    expect(new URL('/users?page=2', 'https://reqres.in/api').href).toBe(
      'https://reqres.in/users?page=2',
    );
    expect(paginationConfig).toContain("target: 'https://reqres.in'");
    expect(authConfig).toContain("target: 'https://reqres.in'");
    expect(pagination).toContain('page.request.get(`/api/users?page=');
    expect(auth).toContain("page.request.get('/api/users')");
    expect(auth).toContain('page.request.get(`/api/users/${userId}`)');
    expect(pagination).not.toContain('REQRES_API_KEY');
    expect(auth).not.toContain('REQRES_API_KEY');
  });
});
