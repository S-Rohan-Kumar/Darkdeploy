import { calculateZTest, normalCDF } from '../src/stats.js';

describe('Statistical Engine (Two-Proportion Z-Test)', () => {
    it('accurately computes standard normal CDF points', () => {
        expect(normalCDF(0)).toBeCloseTo(0.5, 4);
        expect(normalCDF(1.96)).toBeCloseTo(0.975, 2);
        expect(normalCDF(-1.96)).toBeCloseTo(0.025, 2);
    });

    it('identifies a statistically significant winner at 95% confidence', () => {
        const control = { exposures: 1000, conversions: 100 };
        const variant = { exposures: 1000, conversions: 150 };

        const result = calculateZTest(control, variant);

        expect(result.controlConversionRate).toBeCloseTo(0.1, 4);
        expect(result.variantConversionRate).toBeCloseTo(0.15, 4);
        expect(result.relativeLift).toBeCloseTo(50, 1);
        expect(result.zScore).toBeGreaterThan(3.0);
        expect(result.pValue).toBeLessThan(0.001);
        expect(result.isSignificant).toBe(true);
    });

    it('identifies non-significant difference with high p-value', () => {
        const control = { exposures: 100, conversions: 10 };
        const variant = { exposures: 100, conversions: 11 };

        const result = calculateZTest(control, variant);

        expect(result.relativeLift).toBeCloseTo(10, 1);
        expect(result.pValue).toBeGreaterThan(0.05);
        expect(result.isSignificant).toBe(false);
    });

    it('handles zero exposures gracefully without division by zero errors', () => {
        const control = { exposures: 0, conversions: 0 };
        const variant = { exposures: 100, conversions: 10 };

        const result = calculateZTest(control, variant);

        expect(result.zScore).toBe(0);
        expect(result.pValue).toBe(1.0);
        expect(result.isSignificant).toBe(false);
    });

    it('handles zero conversions on both cohorts gracefully', () => {
        const control = { exposures: 100, conversions: 0 };
        const variant = { exposures: 100, conversions: 0 };

        const result = calculateZTest(control, variant);

        expect(result.zScore).toBe(0);
        expect(result.pValue).toBe(1.0);
        expect(result.isSignificant).toBe(false);
    });
});
