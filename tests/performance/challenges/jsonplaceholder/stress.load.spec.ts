import { expectArtilleryLoadSucceeded, runArtilleryTest } from '../../utils/artillery-runner';
import { expect, test } from '../../world';

test.describe('JSONPlaceholder Stress Test', () => {
  test('should handle stress load', async () => {
    const configPath = 'tests/performance/challenges/jsonplaceholder/config/stress-test.yml';
    const result = await runArtilleryTest({ config: configPath });
    expect(result.success).toBe(true);
    expectArtilleryLoadSucceeded(result, 0.05);
  });
});
