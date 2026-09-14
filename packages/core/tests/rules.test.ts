import { matchRule } from '../src/rules.js';
import { TargetingRule, EvaluationContext } from '../src/types.js';

describe('Targeting Rules Matcher', () => {
  const context: EvaluationContext = {
    id: 'usr_1',
    attributes: {
      country: 'IN',
      email: 'alex@company.com',
      age: 28,
      plan: 'premium',
    },
  };

  it('matches EQUALS and IN operators', () => {
    const rule: TargetingRule = {
      id: 'r1',
      attribute: 'country',
      operator: 'EQUALS',
      values: ['IN'],
    };
    expect(matchRule(rule, context)).toBe(true);

    const ruleIn: TargetingRule = {
      id: 'r2',
      attribute: 'plan',
      operator: 'IN',
      values: ['free', 'premium'],
    };
    expect(matchRule(ruleIn, context)).toBe(true);
  });

  it('matches STARTS_WITH and ENDS_WITH operators', () => {
    const ruleEnds: TargetingRule = {
      id: 'r3',
      attribute: 'email',
      operator: 'ENDS_WITH',
      values: ['@company.com'],
    };
    expect(matchRule(ruleEnds, context)).toBe(true);

    const ruleStarts: TargetingRule = {
      id: 'r4',
      attribute: 'email',
      operator: 'STARTS_WITH',
      values: ['alex'],
    };
    expect(matchRule(ruleStarts, context)).toBe(true);
  });

  it('matches numeric GREATER_THAN and LESS_THAN operators', () => {
    const ruleGt: TargetingRule = {
      id: 'r5',
      attribute: 'age',
      operator: 'GREATER_THAN',
      values: ['21'],
    };
    expect(matchRule(ruleGt, context)).toBe(true);

    const ruleLt: TargetingRule = {
      id: 'r6',
      attribute: 'age',
      operator: 'LESS_THAN',
      values: ['18'],
    };
    expect(matchRule(ruleLt, context)).toBe(false);
  });

  it('returns false if attribute is missing', () => {
    const rule: TargetingRule = {
      id: 'r7',
      attribute: 'nonExistent',
      operator: 'EQUALS',
      values: ['test'],
    };
    expect(matchRule(rule, context)).toBe(false);
  });
});