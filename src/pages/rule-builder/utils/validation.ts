import type { Token, Rule, RuleEffect, RuleOperator } from '@/lib/types/ruleBuilder';
import { operatorRequiresValue, getOperatorBySymbol } from './operators';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  parsedRule: Partial<Rule> | null;
}

/**
 * Validate tokens and extract a complete rule
 */
export function validateTokens(tokens: Token[], effect: RuleEffect): ValidationResult {
  const errors: string[] = [];
  let field: string | null = null;
  let operator: RuleOperator | null = null;
  let value: string | number | boolean | null = null;

  // Find field token
  const fieldToken = tokens.find((t) => t.type === 'field');
  if (!fieldToken) {
    errors.push('Missing field');
  } else {
    field = fieldToken.value;
  }

  // Find operator token
  const operatorToken = tokens.find((t) => t.type === 'operator');
  if (!operatorToken) {
    errors.push('Missing operator');
  } else {
    const opDef = getOperatorBySymbol(operatorToken.value);
    if (!opDef) {
      errors.push(`Unknown operator: ${operatorToken.value}`);
    } else {
      operator = opDef.symbol;
    }
  }

  // Find value token (if operator requires it)
  if (operator && operatorRequiresValue(operator)) {
    const valueToken = tokens.find((t) => t.type === 'value');
    if (!valueToken) {
      errors.push('Missing value');
    } else {
      value = parseValue(valueToken.value);
    }
  }

  const isValid = errors.length === 0 && field !== null && operator !== null;

  return {
    isValid,
    errors,
    parsedRule: isValid
      ? {
          field: field!,
          operator: operator!,
          value,
          effect,
        }
      : null,
  };
}

/**
 * Parse a value string into the appropriate type
 */
function parseValue(value: string): string | number | boolean | null {
  // Remove quotes if present
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  // Check for boolean
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;

  // Check for number
  const num = Number(value);
  if (!isNaN(num)) return num;

  // Return as string
  return value;
}

/**
 * Generate a unique rule ID
 */
export function generateRuleId(): string {
  return `rule_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Validate a rule for completeness
 */
export function isRuleComplete(rule: Partial<Rule>): rule is Rule {
  return (
    typeof rule.id === 'string' &&
    typeof rule.field === 'string' &&
    typeof rule.operator === 'string' &&
    typeof rule.effect === 'string'
  );
}
