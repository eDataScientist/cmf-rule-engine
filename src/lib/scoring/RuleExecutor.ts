import type { ClaimData } from '../types/claim';
import type { Rule, CompositeRule, RuleItem, RuleOperator } from '../types/ruleBuilder';
import type {
  RuleExecutionResult,
  RuleMatchResult,
  RuleConditionResult,
} from '../types/ruleExecution';

/**
 * Helper function to convert values to numbers
 * Reused from engine.ts
 */
function toNumeric(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    const parsed = parseFloat(trimmed);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  const coerced = Number(value);
  return Number.isNaN(coerced) ? 0 : coerced;
}

/**
 * Helper function to normalize text for comparison
 * Reused from engine.ts
 */
function normalizeText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim().toLowerCase();
}

/**
 * Rule execution engine
 * Evaluates rules against claims and returns match results
 */
export class RuleExecutor {
  private rules: RuleItem[];

  constructor(rules: RuleItem[]) {
    this.rules = rules;
  }

  /**
   * Evaluate all rules against a single claim
   */
  evaluate(claim: ClaimData): RuleExecutionResult {
    const matchedRules: RuleMatchResult[] = [];

    for (const rule of this.rules) {
      if ('conditions' in rule) {
        // CompositeRule: evaluate with AND/OR logic
        const result = this.evaluateCompositeRule(rule as CompositeRule, claim);
        if (result.matched) {
          matchedRules.push(result);
        }
      } else {
        // Simple Rule: single condition
        const result = this.evaluateSimpleRule(rule as Rule, claim);
        if (result.matched) {
          matchedRules.push(result);
        }
      }
    }

    // Calculate max severity (high > moderate)
    const maxSeverity = matchedRules.length > 0
      ? matchedRules.some((r) => r.severity === 'high')
        ? 'high'
        : 'moderate'
      : null;

    // Extract claim number
    const claimNumber =
      claim['Claim number'] ?? claim['Claim Number'] ?? 'N/A';

    return {
      claimNumber: String(claimNumber),
      claim,
      matchedRules,
      totalMatches: matchedRules.length,
      maxSeverity,
    };
  }

  /**
   * Evaluate a simple rule (single condition)
   */
  private evaluateSimpleRule(rule: Rule, claim: ClaimData): RuleMatchResult {
    const conditionResult = this.evaluateCondition(
      rule.field,
      rule.operator,
      rule.value,
      claim
    );

    return {
      ruleId: rule.id,
      matched: conditionResult.passed,
      severity: rule.effect,
      conditions: [conditionResult],
    };
  }

  /**
   * Evaluate a composite rule (multiple conditions with connectors)
   */
  private evaluateCompositeRule(
    rule: CompositeRule,
    claim: ClaimData
  ): RuleMatchResult {
    const results = rule.conditions.map((cond) =>
      this.evaluateCondition(cond.field, cond.operator, cond.value, claim)
    );

    // Apply connector logic (AND/OR between conditions)
    let matched = results[0].passed;

    for (let i = 0; i < rule.conditions.length - 1; i++) {
      const connector = rule.conditions[i].connector;
      if (connector === 'AND') {
        matched = matched && results[i + 1].passed;
        // Early exit for AND if already false
        if (!matched) break;
      } else if (connector === 'OR') {
        matched = matched || results[i + 1].passed;
        // Early exit for OR if already true
        if (matched) break;
      }
    }

    return {
      ruleId: rule.id,
      matched,
      severity: rule.effect,
      conditions: results,
    };
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(
    field: string,
    operator: RuleOperator,
    expectedValue: any,
    claim: ClaimData
  ): RuleConditionResult {
    const actualValue = claim[field];
    let passed = false;

    switch (operator) {
      case '=':
        passed = actualValue == expectedValue;
        break;

      case '!=':
        passed = actualValue != expectedValue;
        break;

      case '>':
        passed = toNumeric(actualValue) > toNumeric(expectedValue);
        break;

      case '<':
        passed = toNumeric(actualValue) < toNumeric(expectedValue);
        break;

      case '>=':
        passed = toNumeric(actualValue) >= toNumeric(expectedValue);
        break;

      case '<=':
        passed = toNumeric(actualValue) <= toNumeric(expectedValue);
        break;

      case 'contains':
        passed = normalizeText(actualValue).includes(
          normalizeText(expectedValue)
        );
        break;

      case 'starts_with':
        passed = normalizeText(actualValue).startsWith(
          normalizeText(expectedValue)
        );
        break;

      case 'ends_with':
        passed = normalizeText(actualValue).endsWith(
          normalizeText(expectedValue)
        );
        break;

      case 'is_empty':
        passed = !actualValue || String(actualValue).trim() === '';
        break;

      case 'is_not_empty':
        passed = !!actualValue && String(actualValue).trim() !== '';
        break;

      default:
        // Unknown operator
        passed = false;
    }

    return {
      field,
      operator,
      expectedValue,
      actualValue,
      passed,
    };
  }

  /**
   * Evaluate all rules against a batch of claims
   */
  evaluateBatch(claims: ClaimData[]): RuleExecutionResult[] {
    return claims.map((claim) => this.evaluate(claim));
  }
}
