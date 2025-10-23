import type { TreeNode, DecisionNode } from '../types/tree';
import type { NormalizedClaim } from '../types/claim';
import type { TreePath, TraceResult } from '../types/trace';
import { isLeafNode, isDecisionNode } from '../types/tree';
import { normalizeClaim, type ClaimData } from '../types/claim';
import { calculateProbability } from './transforms';
import { classifyRisk } from '../types/trace';

export function evaluateNode(
  node: TreeNode,
  claim: NormalizedClaim,
  nodeIds: string[] = []
): { value: number; nodeIds: string[] } {
  if (isLeafNode(node)) {
    return { value: node.value, nodeIds };
  }

  if (isDecisionNode(node)) {
    const condition = (node as DecisionNode).condition;
    const passes = evaluateCondition(condition, claim);

    return evaluateNode(
      passes ? (node as DecisionNode).true_branch : (node as DecisionNode).false_branch,
      claim,
      nodeIds
    );
  }

  throw new Error('Invalid node type');
}

function evaluateCondition(condition: string, claim: NormalizedClaim): boolean {
  const lteMatch = condition.match(/(.+?)\s*<=\s*(.+)/);
  const gtMatch = condition.match(/(.+?)\s*>\s*(.+)/);
  const isMatch = condition.match(/(.+?)\s+is\s+(.+)/);

  if (lteMatch) {
    const [, feature, threshold] = lteMatch;
    const value = claim[feature.trim()] ?? 0;
    return Number(value) <= Number(threshold.trim());
  }

  if (gtMatch) {
    const [, feature, threshold] = gtMatch;
    const value = claim[feature.trim()] ?? 0;
    return Number(value) > Number(threshold.trim());
  }

  if (isMatch) {
    const [, feature, expectedValue] = isMatch;
    const value = claim[feature.trim()] ?? 0;
    const expected = expectedValue.trim().toLowerCase();

    if (expected === 'yes') return Number(value) > 0.5;
    if (expected === 'no') return Number(value) <= 0.5;

    return String(value) === expected;
  }

  return false;
}

export function evaluateClaim(
  claimData: ClaimData,
  treeStructure: { title: string; root: TreeNode }[]
): TraceResult {
  const claim = normalizeClaim(claimData);
  const paths: TreePath[] = [];
  let totalScore = 0;

  treeStructure.forEach((tree, index) => {
    const { value, nodeIds } = evaluateNode(tree.root, claim, []);

    paths.push({
      treeIndex: index,
      nodeIds,
      leafValue: value,
    });

    totalScore += value;
  });

  const probability = calculateProbability(totalScore);
  const riskLevel = classifyRisk(probability);

  return {
    claimNumber: claimData['Claim number'] || 'N/A',
    claim: claimData,
    paths,
    totalScore,
    probability,
    riskLevel,
  };
}
