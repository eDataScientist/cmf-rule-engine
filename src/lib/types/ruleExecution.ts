import type { RuleOperator, RuleEffect } from './ruleBuilder';
import type { ClaimData } from './claim';

/**
 * Result of evaluating a single condition within a rule
 */
export interface RuleConditionResult {
  field: string;
  operator: RuleOperator;
  expectedValue: any;
  actualValue: any;
  passed: boolean;
}

/**
 * Result of evaluating a single rule (simple or composite) against a claim
 */
export interface RuleMatchResult {
  ruleId: string;
  matched: boolean;
  severity: RuleEffect;
  conditions: RuleConditionResult[];
}

/**
 * Complete result of evaluating all rules against a single claim
 */
export interface RuleExecutionResult {
  claimNumber: string;
  claim: ClaimData;
  matchedRules: RuleMatchResult[];
  totalMatches: number;
  maxSeverity: RuleEffect | null;
}
