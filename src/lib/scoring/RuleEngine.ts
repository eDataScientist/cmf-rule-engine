import { evaluateClaim } from './engine';
import type { ClaimData } from '../types/claim';
import type { TraceResult } from '../types/trace';
import type { TreeNode } from '../types/tree';

/**
 * Rule Engine class for evaluating claims against decision trees
 */
export class RuleEngine {
  private trees: { title: string; root: TreeNode }[];

  constructor(trees: { title: string; root: TreeNode }[]) {
    this.trees = trees;
  }

  /**
   * Evaluate a single claim and return the trace result
   */
  evaluate(claim: ClaimData): TraceResult {
    return evaluateClaim(claim, this.trees);
  }

  /**
   * Evaluate multiple claims in batch
   */
  evaluateBatch(claims: ClaimData[]): TraceResult[] {
    return claims.map((claim) => this.evaluate(claim));
  }

  /**
   * Get the total score for a claim without full trace details
   */
  getScore(claim: ClaimData): number {
    const result = this.evaluate(claim);
    return result.totalScore;
  }

  /**
   * Get the fraud probability for a claim (0-1)
   */
  getProbability(claim: ClaimData): number {
    const result = this.evaluate(claim);
    return result.probability;
  }

  /**
   * Get the risk level classification for a claim
   */
  getRiskLevel(claim: ClaimData): 'low' | 'moderate' | 'high' {
    const result = this.evaluate(claim);
    return result.riskLevel;
  }
}
