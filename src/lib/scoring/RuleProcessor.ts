import type { ClaimData } from '../types/claim';
import type { RuleExecutionResult } from '../types/ruleExecution';
import { RuleExecutor } from './RuleExecutor';

/**
 * Rule processor for batch operations
 * Parallel to TabularClaimsProcessor but for rules instead of trees
 */
export class RuleProcessor {
  private executor: RuleExecutor;

  constructor(executor: RuleExecutor) {
    this.executor = executor;
  }

  /**
   * Process a batch of claims using the rule executor
   */
  processBatch(claims: ClaimData[]): RuleExecutionResult[] {
    return this.executor.evaluateBatch(claims);
  }

  /**
   * Get the rule executor instance
   */
  getExecutor(): RuleExecutor {
    return this.executor;
  }
}
