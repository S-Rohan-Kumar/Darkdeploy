import { TargetingRule, EvaluationContext, Operator } from './types.js';

export function matchRule(rule: TargetingRule, context: EvaluationContext): boolean {
  if (!context.attributes) {
    return false;
  }

  const attrValue = context.attributes[rule.attribute];
  if (attrValue === undefined || attrValue === null) {
    return false;
  }

  const strValue = String(attrValue);

  switch (rule.operator) {
    case 'EQUALS':
      return rule.values.includes(strValue);

    case 'NOT_EQUALS':
      return !rule.values.includes(strValue);

    case 'IN':
      return rule.values.includes(strValue);

    case 'NOT_IN':
      return !rule.values.includes(strValue);

    case 'CONTAINS':
      return rule.values.some((v) => strValue.includes(v));

    case 'STARTS_WITH':
      return rule.values.some((v) => strValue.startsWith(v));

    case 'ENDS_WITH':
      return rule.values.some((v) => strValue.endsWith(v));

    case 'GREATER_THAN': {
      const numVal = Number(attrValue);
      const targetNum = Number(rule.values[0]);
      return !isNaN(numVal) && !isNaN(targetNum) && numVal > targetNum;
    }

    case 'LESS_THAN': {
      const numVal = Number(attrValue);
      const targetNum = Number(rule.values[0]);
      return !isNaN(numVal) && !isNaN(targetNum) && numVal < targetNum;
    }

    default:
      return false;
  }
}