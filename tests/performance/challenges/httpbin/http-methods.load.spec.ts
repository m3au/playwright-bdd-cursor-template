import { expectArtilleryLoadSucceeded, runArtilleryTest } from '../../utils/artillery-runner';
import { expect, test } from '../../world';

test.describe('HTTPBin HTTP Methods Load Test', () => {
  test('should handle HTTP methods load', async () => {
    const configPath = 'tests/performance/challenges/httpbin/config/http-methods-load.yml';
    const result = await runArtilleryTest({ config: configPath });
    expect(result.success).toBe(true);
    expectArtilleryLoadSucceeded(result);
  });
});
