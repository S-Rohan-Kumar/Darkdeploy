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
  type?: 'BOOLEAN' | 'MULTIVARIATE' | 'AI_CONFIG';
  enabled: boolean;
  defaultValue: boolean;
  rolloutPercentage: number;
  rolloutSalt?: string | null;
  aiConfig?: AIConfig | null;
  environmentId: string;
  rules: TargetingRule[];
  createdAt: string;
  updatedAt: string;
}

export interface Environment {
  id: string;
  name: string;
  key: string;
  apiKey: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuditLog {
  id: string;
  flagId?: string | null;
  userId?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  action: string;
  diff?: any;
  createdAt: string;
}

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
  createdAt: string;
  updatedAt: string;
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

export interface ExperimentResultsData {
  experiment: {
    id: string;
    key: string;
    name: string;
    enabled: boolean;
    variants: Variant[];
  };
  variantStats: Record<string, { exposures: number; conversions: number; conversionRate: number }>;
  significanceResults: Record<string, ZTestResult | null>;
  totalEvents: number;
}
