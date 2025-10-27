import { RuleEngine } from '../scoring/RuleEngine';
import type { ClaimData } from '../types/claim';
import type { TraceResult } from '../types/trace';
import type { TreeNode, DecisionNode } from '../types/tree';
import { isDecisionNode } from '../types/tree';

export interface ValidationResult {
  isValid: boolean;
  missingColumns: string[];
  availableColumns: string[];
  requiredColumns: string[];
  claimNumberColumn: string | null;
}

type ExportedClaimRow = ClaimData & {
  fraud_score: number;
  fraud_probability: number;
  risk_level: TraceResult['riskLevel'];
};

/**
 * Comprehensive class for handling tabular claims data ingestion and processing
 */
export class TabularClaimsProcessor {
  private treeStructure: { title: string; root: TreeNode }[];
  private requiredColumns: Set<string>;
  private engine: RuleEngine;
  private claimNumberColumn: string | null = null;

  constructor(treeStructure: { title: string; root: TreeNode }[]) {
    this.treeStructure = treeStructure;
    this.requiredColumns = this.extractRequiredColumns();
    this.engine = new RuleEngine(treeStructure);
  }

  /**
   * Set which column should be used as the claim number
   */
  setClaimNumberColumn(columnName: string): void {
    this.claimNumberColumn = columnName;
  }

  /**
   * Get the current claim number column mapping
   */
  getClaimNumberColumn(): string | null {
    return this.claimNumberColumn;
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

    // Check for missing required columns (excluding claim number)
    this.requiredColumns.forEach((required) => {
      if (!availableColumns.has(required)) {
        missingColumns.push(required);
      }
    });

    // Validation is successful if all required columns are present
    // Claim number column must be set separately
    const isValid = missingColumns.length === 0 && this.claimNumberColumn !== null;

    return {
      isValid,
      missingColumns,
      availableColumns: csvColumns,
      requiredColumns: Array.from(this.requiredColumns),
      claimNumberColumn: this.claimNumberColumn,
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
    // If no claim number column is mapped, return as-is
    if (!this.claimNumberColumn) {
      return claim;
    }

    // Map the selected column to the canonical 'Claim number' key
    if (this.claimNumberColumn in claim && !('Claim number' in claim)) {
      const normalizedClaimNumber = this.normalizeClaimNumberValue(
        claim[this.claimNumberColumn]
      );

      if (normalizedClaimNumber !== undefined) {
        return {
          ...claim,
          'Claim number': normalizedClaimNumber,
        };
      }
    }

    return claim;
  }

  private normalizeClaimNumberValue(
    value: string | number | boolean | undefined
  ): string | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    return undefined;
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

    // Include the mapped claim number column
    if (this.claimNumberColumn && this.claimNumberColumn in claim) {
      filtered[this.claimNumberColumn] = claim[this.claimNumberColumn];
    }

    // Include normalized claim number if present
    if ('Claim number' in claim) {
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
  exportResults(claims: ClaimData[], results: TraceResult[]): ExportedClaimRow[] {
    return claims.map((claim, idx) => {
      const filtered = this.filterForExport(claim);
      const result = results[idx];

      return {
        ...filtered,
        fraud_score: parseFloat(result.totalScore.toFixed(3)),
        fraud_probability: parseFloat((result.probability * 100).toFixed(1)),
        risk_level: result.riskLevel,
      } satisfies ExportedClaimRow;
    });
  }
}
