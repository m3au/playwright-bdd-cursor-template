import { expectArtilleryLoadSucceeded, runArtilleryTest } from '../../utils/artillery-runner';
import { expect, test } from '../../world';

test.describe('ReqRes.in Authenticated Load Test', () => {
  test('should handle normal load', async () => {
    const configPath = 'tests/performance/challenges/reqres/config/authenticated-load.yml';
    const result = await runArtilleryTest({ config: configPath });
    expect(result.success).toBe(true);
    expectArtilleryLoadSucceeded(result);
  });
});
