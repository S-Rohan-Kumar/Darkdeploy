import { evaluate } from "../src/evaluator.js";
import { Flag, EvaluationContext } from "../src/types.js";

describe("Flag Evaluator Engine", () => {
    const baseFlag: Flag = {
        key: "new-search-engine",
        enabled: true,
        defaultValue: false,
        rules: [
            {
                id: "rule-beta-users",
                attribute: "plan",
                operator: "EQUALS",
                values: ["enterprise"],
                serveValue: true,
            },
        ],
        rollout: {
            percentage: 50,
        },
    };

    it("returns OFF with defaultValue when flag.enabled is false", () => {
        const disabledFlag: Flag = { ...baseFlag, enabled: false };
        const context: EvaluationContext = {
            id: "usr_1",
            attributes: { plan: "enterprise" }, // even though rule matches!
        };

        const result = evaluate(disabledFlag, context);

        expect(result.value).toBe(false);
        expect(result.reason).toBe("OFF");
    });

    it("returns RULE_MATCH when an attribute rule matches", () => {
        const context: EvaluationContext = {
            id: "usr_enterprise",
            attributes: { plan: "enterprise" },
        };

        const result = evaluate(baseFlag, context);

        expect(result.value).toBe(true);
        expect(result.reason).toBe("RULE_MATCH");
        expect(result.ruleId).toBe("rule-beta-users");
    });

    it("falls back to ROLLOUT when no rules match", () => {
        const context: EvaluationContext = {
            id: "usr_regular",
            attributes: { plan: "free" },
        };

        const result = evaluate(baseFlag, context);

        expect(result.reason).toBe("ROLLOUT");
        expect(typeof result.value).toBe("boolean");
    });

    it("evaluates 0% and 100% rollout shortcuts correctly", () => {
        const zeroPercentFlag: Flag = {
            ...baseFlag,
            rules: [],
            rollout: { percentage: 0 },
        };
        const hundredPercentFlag: Flag = {
            ...baseFlag,
            rules: [],
            rollout: { percentage: 100 },
        };

        const context: EvaluationContext = { id: "usr_random" };

        expect(evaluate(zeroPercentFlag, context).value).toBe(false);
        expect(evaluate(hundredPercentFlag, context).value).toBe(true);
    });
});
