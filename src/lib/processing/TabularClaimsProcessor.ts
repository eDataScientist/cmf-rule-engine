import { RuleEngine } from '../scoring/RuleEngine';
import type { ClaimData } from '../types/claim';
import type { TraceResult } from '../types/trace';
import type { TreeNode, DecisionNode } from '../types/tree';
import { isDecisionNode } from '../types/tree';

interface ValidationResult {
  isValid: boolean;
  missingColumns: string[];
  availableColumns: string[];
  requiredColumns: string[];
}

/**
 * Comprehensive class for handling tabular claims data ingestion and processing
 */
export class TabularClaimsProcessor {
  private treeStructure: { title: string; root: TreeNode }[];
  private requiredColumns: Set<string>;
  private engine: RuleEngine;

  constructor(treeStructure: { title: string; root: TreeNode }[]) {
    this.treeStructure = treeStructure;
    this.requiredColumns = this.extractRequiredColumns();
    this.engine = new RuleEngine(treeStructure);
  }

  /**
   * Extract all feature names used in tree conditions
   */
  private extractRequiredColumns(): Set<string> {
    const columns = new Set<string>();

    const traverse = (node: TreeNode) => {
      if (isDecisionNode(node)) {
        const decisionNode = node as DecisionNode;
        const feature = this.extractFeatureFromCondition(decisionNode.condition);
        if (feature) {
          columns.add(feature);
        }
        traverse(decisionNode.true_branch);
        traverse(decisionNode.false_branch);
      }
    };

    this.treeStructure.forEach((tree) => traverse(tree.root));

    // Always require Claim Number
    columns.add('Claim Number');

    return columns;
  }

  /**
   * Extract feature name from condition string
   */
  private extractFeatureFromCondition(condition: string): string | null {
    // Match patterns: "feature <= value", "feature >= value", "feature > value", "feature is Yes/No"
    const leMatch = condition.match(/^(.+?)\s*<=\s*(.+)$/);
    const geMatch = condition.match(/^(.+?)\s*>=\s*(.+)$/);
    const gtMatch = condition.match(/^(.+?)\s*>\s*(.+)$/);
    const isMatch = condition.match(/^(.+?)\s+is\s+(Yes|No)$/i);

    if (leMatch) return leMatch[1].trim();
    if (geMatch) return geMatch[1].trim();
    if (gtMatch) return gtMatch[1].trim();
    if (isMatch) return isMatch[1].trim();

    return null;
  }

  /**
   * Validate CSV data against tree requirements
   */
  validateColumns(csvColumns: string[]): ValidationResult {
    const availableColumns = new Set(csvColumns);
    const missingColumns: string[] = [];

    // Check for missing required columns
    this.requiredColumns.forEach((required) => {
      if (!availableColumns.has(required)) {
        missingColumns.push(required);
      }
    });

    return {
      isValid: missingColumns.length === 0,
      missingColumns,
      availableColumns: csvColumns,
      requiredColumns: Array.from(this.requiredColumns),
    };
  }

  /**
   * Get list of required columns
   */
  getRequiredColumns(): string[] {
    return Array.from(this.requiredColumns).sort();
  }

  /**
   * Ensure claim data contains the canonical claim number key expected by the engine.
   */
  private normalizeClaimKeys(claim: ClaimData): ClaimData {
    const claimIdentifier = claim['Claim Number'] ?? claim['Claim number'];

    if (claimIdentifier === undefined || claimIdentifier === null || claimIdentifier === '') {
      return claim;
    }

    const normalized = typeof claimIdentifier === 'string' ? claimIdentifier : String(claimIdentifier);

    return {
      ...claim,
      'Claim Number': normalized,
      'Claim number': normalized,
    };
  }

  /**
   * Filter claim data to include only the columns we want to export.
   */
  private filterForExport(claim: ClaimData): ClaimData {
    const filtered: ClaimData = {};

    this.requiredColumns.forEach((column) => {
      if (column in claim) {
        filtered[column] = claim[column];
      }
    });

    if ('Claim Number' in claim && !('Claim Number' in filtered)) {
      filtered['Claim Number'] = claim['Claim Number'];
    }

    if ('Claim number' in claim && !('Claim number' in filtered)) {
      filtered['Claim number'] = claim['Claim number'];
    }

    return filtered;
  }

  /**
   * Process a single claim
   */
  processClaim(claim: ClaimData): TraceResult {
    const normalized = this.normalizeClaimKeys(claim);
    return this.engine.evaluate(normalized);
  }

  /**
   * Process multiple claims in batch
   */
  processBatch(claims: ClaimData[]): TraceResult[] {
    return claims.map((claim) => this.processClaim(claim));
  }

  /**
   * Get summary statistics for processed results
   */
  getStatistics(results: TraceResult[]): {
    total: number;
    highRisk: number;
    moderateRisk: number;
    lowRisk: number;
    averageScore: number;
    averageProbability: number;
  } {
    const total = results.length;
    const highRisk = results.filter((r) => r.riskLevel === 'high').length;
    const moderateRisk = results.filter((r) => r.riskLevel === 'moderate').length;
    const lowRisk = results.filter((r) => r.riskLevel === 'low').length;

    const totalScore = results.reduce((sum, r) => sum + r.totalScore, 0);
    const totalProb = results.reduce((sum, r) => sum + r.probability, 0);

    return {
      total,
      highRisk,
      moderateRisk,
      lowRisk,
      averageScore: total > 0 ? totalScore / total : 0,
      averageProbability: total > 0 ? totalProb / total : 0,
    };
  }

  /**
   * Export results with only required columns plus scores
   */
  exportResults(claims: ClaimData[], results: TraceResult[]): any[] {
    return claims.map((claim, idx) => {
      const normalized = this.normalizeClaimKeys(claim);
      const filtered = this.filterForExport(normalized);
      const result = results[idx];

      return {
        ...filtered,
        fraud_score: parseFloat(result.totalScore.toFixed(3)),
        fraud_probability: parseFloat((result.probability * 100).toFixed(1)),
        risk_level: result.riskLevel,
      };
    });
  }
}
