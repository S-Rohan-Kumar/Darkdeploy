import { computeBucket } from "./hashing.js";
import { EvaluationContext } from "./types.js";

export interface Variant {
    key: string;
    name?: string;
    weight: number;
    payload?: any;
}

export interface Experiment {
    id: string;
    key: string;
    name: string;
    description?: string | null;
    enabled: boolean;
    variants: Variant[];
    environmentId: string;
    salt?: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export interface VariantAssignment {
    variant: Variant;
    bucketValue: number;
}

export function assignVariant(
    experiment: Experiment,
    context: EvaluationContext,
    salt = "darkdeploy-exp-salt"
): VariantAssignment | null {
    if (!experiment.enabled || !experiment.variants || experiment.variants.length === 0) {
        return null;
    }

    const contextId = context.id || (context as any).key;
    if (!contextId) {
        return {
            variant: experiment.variants[0],
            bucketValue: 0,
        };
    }

    const totalWeight = experiment.variants.reduce((acc, v) => acc + (v.weight || 0), 0);
    if (totalWeight <= 0) {
        return {
            variant: experiment.variants[0],
            bucketValue: 0,
        };
    }

    const activeSalt = experiment.salt || salt;
    const bucketValue = computeBucket(contextId, `${experiment.key}:${activeSalt}`);

    const normalizedBucket = (bucketValue / 100) * totalWeight;

    let cumulative = 0;
    for (const variant of experiment.variants) {
        cumulative += variant.weight;
        if (normalizedBucket <= cumulative) {
            return {
                variant,
                bucketValue,
            };
        }
    }

    return {
        variant: experiment.variants[experiment.variants.length - 1],
        bucketValue,
    };
}