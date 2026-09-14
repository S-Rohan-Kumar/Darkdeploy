import { computeBucket } from '../src/hashing.js';

describe('Deterministic Hashing Engine', () => {
  it('should return identical results for identical inputs (determinism)', () => {
    const bucketA = computeBucket('usr_99', 'flag_checkout');
    const bucketB = computeBucket('usr_99', 'flag_checkout');

    expect(bucketA).toBe(bucketB);
  });

  it('should return values strictly bounded by [0.0, 100.0)', () => {
    for (let i = 0; i < 1_000; i++) {
      const bucket = computeBucket(`usr_${i}`, 'flag_search');

      expect(bucket).toBeGreaterThanOrEqual(0.0);
      expect(bucket).toBeLessThan(100.0);
    }
  });

  it('should decorrelate bucket values between different flags for the same user', () => {
    const bucket1 = computeBucket('usr_42', 'flag_feature_a');
    const bucket2 = computeBucket('usr_42', 'flag_feature_b');

    expect(bucket1).not.toBe(bucket2);
  });

  it('should distribute within standard error tolerance across 10,000 users', () => {
    const TOTAL_USERS = 10_000;
    const TARGET_PERCENT = 20.0; // 20% rollout
    let activeUsers = 0;

    for (let i = 0; i < TOTAL_USERS; i++) {
      const bucket = computeBucket(`usr_${i}`, 'flag_experiment');
      if (bucket < TARGET_PERCENT) {
        activeUsers++;
      }
    }

    const actualPercent = (activeUsers / TOTAL_USERS) * 100;
    expect(actualPercent).toBeGreaterThanOrEqual(18.5);
    expect(actualPercent).toBeLessThanOrEqual(21.5);
  });
});