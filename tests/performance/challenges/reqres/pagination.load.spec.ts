import { expectArtilleryLoadSucceeded, runArtilleryTest } from '../../utils/artillery-runner';
import { expect, test } from '../../world';

test.describe('ReqRes.in Pagination Load Test', () => {
  test('should handle pagination load', async () => {
    const configPath = 'tests/performance/challenges/reqres/config/pagination-load.yml';
    const result = await runArtilleryTest({ config: configPath });
    expect(result.success).toBe(true);
    expectArtilleryLoadSucceeded(result);
  });
});
