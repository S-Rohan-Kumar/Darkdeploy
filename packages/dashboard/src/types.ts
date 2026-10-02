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

export interface Flag {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  enabled: boolean;
  defaultValue: boolean;
  rolloutPercentage: number;
  rolloutSalt?: string | null;
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
