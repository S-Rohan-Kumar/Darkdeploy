export type Operator =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'IN'
  | 'NOT_IN'
  | 'CONTAINS'
  | 'STARTS_WITH'
  | 'ENDS_WITH'
  | 'GREATER_THAN'
  | 'LESS_THAN';

export interface TargetingRule {
  id?: string;
  attribute: string;
  operator: Operator;
  values: string[];
  serveValue?: boolean;
  priority?: number;
}

export type FlagType = 'BOOLEAN' | 'MULTIVARIATE' | 'AI_CONFIG';

export interface AIConfig {
  model: string;
  temperature: number;
  systemPrompt: string;
  maxTokens?: number;
}

export interface Flag {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  type?: FlagType;
  enabled: boolean;
  defaultValue: boolean;
  rolloutPercentage?: number;
  rolloutSalt?: string | null;
  rollout?: {
    percentage: number;
    salt?: string;
  };
  aiConfig?: AIConfig | null;
  environmentId?: string;
  rules?: TargetingRule[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
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