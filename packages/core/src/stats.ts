export interface CohortStats {
    exposures: number;
    conversions: number;
}

export interface ZTestResult {
    controlConversionRate: number;
    variantConversionRate: number;
    relativeLift: number;
    zScore: number;
    pValue: number;
    isSignificant: boolean;
    confidenceLevel: number;
}

export function normalCDF(z: number): number {
    const sign = z < 0 ? -1 : 1;
    const absZ = Math.abs(z);

    const p = 0.2316419;
    const b1 = 0.31938153;
    const b2 = -0.356563782;
    const b3 = 1.781477937;
    const b4 = -1.821255978;
    const b5 = 1.330274429;

    const t = 1.0 / (1.0 + p * absZ);
    const pdf = Math.exp(-0.5 * absZ * absZ) / Math.sqrt(2.0 * Math.PI);
    const cdf = 1.0 - pdf * (b1 * t + b2 * Math.pow(t, 2) + b3 * Math.pow(t, 3) + b4 * Math.pow(t, 4) + b5 * Math.pow(t, 5));

    return sign === 1 ? cdf : 1.0 - cdf;
}

export function calculateZTest(
    control: CohortStats,
    variant: CohortStats,
    alpha = 0.05
): ZTestResult {
    const n1 = control.exposures;
    const x1 = control.conversions;
    const n2 = variant.exposures;
    const x2 = variant.conversions;

    const p1 = n1 > 0 ? x1/n1 : 0;
    const p2 = n2 > 0 ? x2/n2 : 0;

    const relativeLift = p1 > 0 ? ((p2 - p1) / p1) * 100 : 0;

    if (n1 === 0 || n2 === 0) {
        return {
            controlConversionRate: p1,
            variantConversionRate: p2,
            relativeLift,
            zScore: 0,
            pValue: 1.0,
            isSignificant: false,
            confidenceLevel: (1 - alpha) * 100,
        };
    }

    const pooledP = (x1 + x2) / (n1 + n2);

    if (pooledP === 0 || pooledP === 1) {
        return {
            controlConversionRate: p1,
            variantConversionRate: p2,
            relativeLift,
            zScore: 0,
            pValue: 1.0,
            isSignificant: false,
            confidenceLevel: (1 - alpha) * 100,
        };
    }

    const se = Math.sqrt(pooledP * (1 - pooledP) * (1 / n1 + 1 / n2));
    const zScore = (p2 - p1) / se;

    const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));
    const isSignificant = pValue <= alpha;

    return {
        controlConversionRate: p1,
        variantConversionRate: p2,
        relativeLift,
        zScore,
        pValue,
        isSignificant,
        confidenceLevel: (1 - alpha) * 100,
    };
}