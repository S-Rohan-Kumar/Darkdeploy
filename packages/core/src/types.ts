export type Operator =
    | "EQUALS"
    | "NOT_EQUALS"
    | "IN"
    | "NOT_IN"
    | "CONTAINS"
    | "STARTS_WITH"
    | "ENDS_WITH"
    | "GREATER_THAN"
    | "LESS_THAN";

export interface TargetingRule {
    id: string;
    attribute: string;
    operator: Operator;
    values: string[];
    serveValue?: boolean;
}

export interface Rollout {
    percentage: number;
    salt?: string;
}

export interface Flag {
    key: string;
    enabled: boolean;
    rules: TargetingRule[];
    rollout: Rollout;
    defaultValue: boolean;
}

export interface EvaluationContext {
    id: string;
    attributes?: Record<string, string | number | boolean>;
}

export interface EvaluationResult {
    value: boolean;
    reason: "OFF" | "RULE_MATCH" | "ROLLOUT" | "DEFAULT";
    ruleId?: string;
}
