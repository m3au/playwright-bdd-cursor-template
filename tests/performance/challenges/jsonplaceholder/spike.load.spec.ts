import { expectArtilleryLoadSucceeded, runArtilleryTest } from '../../utils/artillery-runner';
import { expect, test } from '../../world';

test.describe('JSONPlaceholder Spike Test', () => {
  test('should handle spike load', async () => {
    const configPath = 'tests/performance/challenges/jsonplaceholder/config/spike-test.yml';
    const result = await runArtilleryTest({ config: configPath });
    expect(result.success).toBe(true);
    expectArtilleryLoadSucceeded(result);
  });
});
