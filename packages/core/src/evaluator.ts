import { Flag, EvaluationContext, EvaluationResult } from "./types.js";
import { matchRule } from "./rules.js";
import { computeBucket } from "./hashing.js";

export function evaluate(
    flag: Flag,
    context: EvaluationContext,
): EvaluationResult {
    if (!flag.enabled) {
        return {
            value: flag.defaultValue,
            reason: "OFF",
        };
    }

    for (const rule of flag.rules) {
        if (matchRule(rule, context)) {
            return {
                value: rule.serveValue !== undefined ? rule.serveValue : true,
                reason: "RULE_MATCH",
                ruleId: rule.id,
            };
        }
    }

    if (flag.rollout && flag.rollout.percentage !== undefined) {
        if (flag.rollout.percentage <= 0) {
            return {
                value: false,
                reason: "ROLLOUT",
            };
        }

        if (flag.rollout.percentage >= 100) {
            return {
                value: true,
                reason: "ROLLOUT",
            };
        }
        const salt = flag.rollout.salt || flag.key;
        const bucket = computeBucket(context.id, salt);

        const isIncluded = bucket < flag.rollout.percentage;

        return {
            value: isIncluded,
            reason: "ROLLOUT",
        };
    }
    return {
        value: flag.defaultValue,
        reason: "DEFAULT",
    };
}
