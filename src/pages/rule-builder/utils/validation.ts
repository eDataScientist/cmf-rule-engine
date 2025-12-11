import type { Token, Rule, RuleEffect, RuleOperator, RuleConnector, SyntaxValidation } from '@/lib/types/ruleBuilder';
import { operatorRequiresValue, getOperatorBySymbol, OPERATOR_SYMBOLS } from './operators';

// Parsed condition from tokens
export interface ParsedCondition {
  field: string;
  operator: RuleOperator;
  value: string | number | boolean | null;
  effect: RuleEffect;
  connector?: RuleConnector;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  parsedRule: Partial<Rule> | null;
  parsedRules: ParsedCondition[]; // Support for compound expressions
}

/**
 * Grammar Rules:
 * logical_op := AND | OR
 * expr       := term | term logical_op expr
 * term       := condition
 * condition  := field operator value
 *
 * Expected sequence: [field, operator, value] (AND|OR [field, operator, value])*
 */

type ExpectedTokenType = 'field' | 'operator' | 'value' | 'connector_or_end';

/**
 * Validate token sequence against grammar rules and mark errors
 */
export function validateSyntax(
  tokens: Token[],
  knownFields: Set<string>
): SyntaxValidation {
  if (tokens.length === 0) {
    return { isValid: true, tokens: [], errorMessage: undefined };
  }

  const validatedTokens: Token[] = [];
  let expected: ExpectedTokenType = 'field';
  let isValid = true;
  let errorMessage: string | undefined;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const validatedToken: Token = { ...token };

    switch (expected) {
      case 'field':
        // Expecting a field name
        if (token.type === 'field' || knownFields.has(token.value.toLowerCase())) {
          validatedToken.type = 'field';
          validatedToken.hasError = false;
          expected = 'operator';
        } else if (token.type === 'unknown' && !isOperatorOrConnector(token.value)) {
          // Unknown token in field position - might be partial typing, no error yet
          validatedToken.hasError = false;
          expected = 'operator';
        } else {
          validatedToken.hasError = true;
          validatedToken.errorMessage = `Expected field name, got "${token.value}"`;
          isValid = false;
          errorMessage = validatedToken.errorMessage;
        }
        break;

      case 'operator':
        // Expecting an operator
        if (token.type === 'operator' || OPERATOR_SYMBOLS.includes(token.value.toLowerCase() as any)) {
          validatedToken.type = 'operator';
          validatedToken.hasError = false;
          // Check if operator requires value
          const op = getOperatorBySymbol(token.value);
          if (op && !operatorRequiresValue(op.symbol)) {
            expected = 'connector_or_end';
          } else {
            expected = 'value';
          }
        } else {
          validatedToken.hasError = true;
          validatedToken.errorMessage = `Expected operator, got "${token.value}"`;
          isValid = false;
          errorMessage = validatedToken.errorMessage;
        }
        break;

      case 'value':
        // Expecting a value
        if (token.type === 'value' || token.type === 'unknown') {
          validatedToken.type = 'value';
          validatedToken.hasError = false;
          expected = 'connector_or_end';
        } else if (token.type === 'connector') {
          // Got connector when expecting value - error
          validatedToken.hasError = true;
          validatedToken.errorMessage = `Expected value, got "${token.value}"`;
          isValid = false;
          errorMessage = validatedToken.errorMessage;
        } else {
          validatedToken.hasError = true;
          validatedToken.errorMessage = `Expected value, got "${token.value}"`;
          isValid = false;
          errorMessage = validatedToken.errorMessage;
        }
        break;

      case 'connector_or_end':
        // Expecting AND/OR or end of expression
        if (token.type === 'connector') {
          validatedToken.hasError = false;
          expected = 'field';
        } else {
          validatedToken.hasError = true;
          validatedToken.errorMessage = `Expected AND/OR, got "${token.value}"`;
          isValid = false;
          errorMessage = validatedToken.errorMessage;
        }
        break;
    }

    validatedTokens.push(validatedToken);
  }

  return { isValid, tokens: validatedTokens, errorMessage };
}

/**
 * Check if a value is an operator or connector
 */
function isOperatorOrConnector(value: string): boolean {
  const lower = value.toLowerCase();
  return (
    OPERATOR_SYMBOLS.includes(lower as any) ||
    lower === 'and' ||
    lower === 'or'
  );
}

/**
 * Get the expected next token type based on current tokens
 */
export function getExpectedTokenType(tokens: Token[]): ExpectedTokenType {
  if (tokens.length === 0) return 'field';

  const lastToken = tokens[tokens.length - 1];

  switch (lastToken.type) {
    case 'field':
      return 'operator';
    case 'operator':
      // Check if operator requires value
      const op = getOperatorBySymbol(lastToken.value);
      if (op && !operatorRequiresValue(op.symbol)) {
        return 'connector_or_end';
      }
      return 'value';
    case 'value':
      return 'connector_or_end';
    case 'connector':
      return 'field';
    default:
      return 'field';
  }
}

/**
 * Validate tokens and extract rules (supports compound expressions)
 */
export function validateTokens(tokens: Token[], effect: RuleEffect): ValidationResult {
  const errors: string[] = [];
  const parsedRules: ParsedCondition[] = [];

  if (tokens.length === 0) {
    return { isValid: false, errors: ['No input'], parsedRule: null, parsedRules: [] };
  }

  // Split tokens into conditions by connectors
  const conditions: { tokens: Token[]; connector?: RuleConnector }[] = [];
  let currentCondition: Token[] = [];

  for (const token of tokens) {
    if (token.type === 'connector') {
      if (currentCondition.length > 0) {
        conditions.push({
          tokens: currentCondition,
          connector: token.value.toUpperCase() as RuleConnector,
        });
        currentCondition = [];
      }
    } else {
      currentCondition.push(token);
    }
  }

  // Add last condition (no connector after it)
  if (currentCondition.length > 0) {
    conditions.push({ tokens: currentCondition });
  }

  // Parse each condition into a rule
  for (let i = 0; i < conditions.length; i++) {
    const condition = conditions[i];
    const conditionTokens = condition.tokens;

    let field: string | null = null;
    let operator: RuleOperator | null = null;
    let value: string | number | boolean | null = null;

    // Find field token
    const fieldToken = conditionTokens.find((t) => t.type === 'field');
    if (!fieldToken) {
      errors.push(`Condition ${i + 1}: Missing field`);
    } else {
      field = fieldToken.value;
    }

    // Find operator token
    const operatorToken = conditionTokens.find((t) => t.type === 'operator');
    if (!operatorToken) {
      errors.push(`Condition ${i + 1}: Missing operator`);
    } else {
      const opDef = getOperatorBySymbol(operatorToken.value);
      if (!opDef) {
        errors.push(`Condition ${i + 1}: Unknown operator: ${operatorToken.value}`);
      } else {
        operator = opDef.symbol;
      }
    }

    // Find value token (if operator requires it)
    if (operator && operatorRequiresValue(operator)) {
      const valueToken = conditionTokens.find((t) => t.type === 'value');
      if (!valueToken) {
        errors.push(`Condition ${i + 1}: Missing value`);
      } else {
        value = parseValue(valueToken.value);
      }
    }

    if (field && operator) {
      parsedRules.push({
        field,
        operator,
        value,
        effect,
        connector: condition.connector, // AND/OR to next rule
      });
    }
  }

  const isValid = errors.length === 0 && parsedRules.length > 0;

  return {
    isValid,
    errors,
    parsedRule: isValid ? parsedRules[0] : null, // For backwards compatibility
    parsedRules: isValid ? parsedRules : [],
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
