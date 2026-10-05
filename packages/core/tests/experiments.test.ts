import { assignVariant, Experiment } from '../src/experiments.js';

describe('Experiment Multi-Variant Assignment', () => {
    const testExperiment: Experiment = {
        id: 'exp-1',
        key: 'pricing-page-redesign',
        name: 'Pricing Page Redesign',
        enabled: true,
        environmentId: 'env-1',
        variants: [
            { key: 'control', name: 'Control (Original)', weight: 50 },
            { key: 'variant-a', name: 'Variant A (Annual Toggle)', weight: 30 },
            { key: 'variant-b', name: 'Variant B (Monthly Highlight)', weight: 20 },
        ],
    };

    it('returns null if experiment is disabled', () => {
        const disabledExp = { ...testExperiment, enabled: false };
        const result = assignVariant(disabledExp, { id: 'user-1' });
        expect(result).toBeNull();
    });

    it('returns null if experiment has no variants', () => {
        const noVariantsExp = { ...testExperiment, variants: [] };
        const result = assignVariant(noVariantsExp, { id: 'user-1' });
        expect(result).toBeNull();
    });

    it('is strictly deterministic: identical context produces identical variant', () => {
        const run1 = assignVariant(testExperiment, { id: 'user-alice' });
        const run2 = assignVariant(testExperiment, { id: 'user-alice' });
        const run3 = assignVariant(testExperiment, { id: 'user-alice' });

        expect(run1).not.toBeNull();
        expect(run1?.variant.key).toBe(run2?.variant.key);
        expect(run1?.variant.key).toBe(run3?.variant.key);
        expect(run1?.bucketValue).toBe(run2?.bucketValue);
    });

    it('distributes 1,000 users across 50/30/20 weights within expected bounds', () => {
        const counts: Record<string, number> = {
            control: 0,
            'variant-a': 0,
            'variant-b': 0,
        };

        const totalUsers = 1000;
        for (let i = 0; i < totalUsers; i++) {
            const assignment = assignVariant(testExperiment, { id: `user-sim-${i}` });
            expect(assignment).not.toBeNull();
            if (assignment) {
                counts[assignment.variant.key]++;
            }
        }

        const controlPct = (counts['control'] / totalUsers) * 100;
        const variantAPct = (counts['variant-a'] / totalUsers) * 100;
        const variantBPct = (counts['variant-b'] / totalUsers) * 100;

        expect(controlPct).toBeGreaterThan(44);
        expect(controlPct).toBeLessThan(56);

        expect(variantAPct).toBeGreaterThan(25);
        expect(variantAPct).toBeLessThan(35);

        expect(variantBPct).toBeGreaterThan(15);
        expect(variantBPct).toBeLessThan(25);
    });

    it('changes assignment bucket when salt is modified', () => {
        const res1 = assignVariant(testExperiment, { id: 'user-bob' }, 'salt-1');
        const res2 = assignVariant(testExperiment, { id: 'user-bob' }, 'salt-2');

        expect(res1?.bucketValue).not.toBe(res2?.bucketValue);
    });
});
