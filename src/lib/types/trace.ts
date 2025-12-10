import type { ClaimData } from './claim';

export interface TreePath {
  treeIndex: number;
  nodeIds: string[];
  leafValue: number;
}

export interface TraceResult {
  claimNumber: string;
  claim: ClaimData;
  paths: TreePath[];
  totalScore: number;
  probability: number;
  riskLevel: 'low' | 'moderate' | 'high';
}

export function classifyRisk(probability: number): 'low' | 'moderate' | 'high' {
  if (probability >= 0.75) return 'high';
  if (probability >= 0.5) return 'moderate';
  return 'low';
}

export interface EnrichedTraceResult extends TraceResult {
  estimatedAmount: number | null;
}

export interface PriceDistributionBin {
  binLabel: string;
  count: number;
  minValue: number;
  maxValue: number;
}

export interface FinancialMetrics {
  totalClaimedValue: number;
  averageClaimValue: number;
  claimsWithFinancialData: number;
  valueByRisk: {
    low: { totalValue: number; avgValue: number; count: number };
    moderate: { totalValue: number; avgValue: number; count: number };
    high: { totalValue: number; avgValue: number; count: number };
  };
  priceDistribution: {
    high: PriceDistributionBin[];
    low: PriceDistributionBin[];
  };
}
