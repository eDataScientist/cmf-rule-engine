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
  if (probability > 0.65) return 'high';
  if (probability > 0.4) return 'moderate';
  return 'low';
}
