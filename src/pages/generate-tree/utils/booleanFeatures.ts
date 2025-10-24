import type { TreeNode } from '@/lib/types/tree';
import { isLeafNode } from '@/lib/types/tree';

const HALF_THRESHOLD = 0.5;
const EPSILON = 1e-6;

export type BooleanDecisionMap = Record<string, boolean>;

export interface BooleanCandidate {
  key: string;
  treeIndex: number;
  path: string;
  feature: string;
  operator: '<=' | '>=';
  thresholdText: string;
  originalCondition: string;
}

interface ParsedCondition {
  feature: string;
  operator: '<=' | '>=';
  thresholdText: string;
}

function makeNodeKey(treeIndex: number, path: string): string {
  return `${treeIndex}:${path}`;
}

function parsePotentialBooleanCondition(condition: string): ParsedCondition | null {
  const lteMatch = condition.match(/^(.+?)\s*<=\s*(.+)$/);
  const gteMatch = condition.match(/^(.+?)\s*>=\s*(.+)$/);

  const match = lteMatch || gteMatch;
  if (!match) return null;

  const [, rawFeature, rawThreshold] = match;
  const feature = rawFeature.trim();
  const thresholdText = rawThreshold.trim();
  const thresholdValue = parseFloat(thresholdText);

  if (Number.isNaN(thresholdValue)) {
    return null;
  }

  if (Math.abs(thresholdValue - HALF_THRESHOLD) > EPSILON) {
    return null;
  }

  return {
    feature,
    operator: lteMatch ? '<=' : '>=',
    thresholdText,
  };
}

export function detectBooleanCandidates(
  trees: { title: string; root: TreeNode }[]
): BooleanCandidate[] {
  const candidates: BooleanCandidate[] = [];

  trees.forEach((tree, treeIndex) => {
    const traverse = (node: TreeNode, path: string) => {
      if (isLeafNode(node)) return;

      const parsed = parsePotentialBooleanCondition(node.condition);
      if (parsed) {
        const key = makeNodeKey(treeIndex, path);
        candidates.push({
          key,
          treeIndex,
          path,
          feature: parsed.feature,
          operator: parsed.operator,
          thresholdText: parsed.thresholdText,
          originalCondition: node.condition,
        });
      }

      traverse(node.true_branch, `${path}.T`);
      traverse(node.false_branch, `${path}.F`);
    };

    traverse(tree.root, 'root');
  });

  return candidates;
}

export function applyBooleanDecisions(
  trees: { title: string; root: TreeNode }[] | null,
  decisions: BooleanDecisionMap
): { title: string; root: TreeNode }[] | null {
  if (!trees) return null;

  return trees.map((tree, treeIndex) => {
    const transform = (node: TreeNode, path: string): TreeNode => {
      if (isLeafNode(node)) {
        return { value: node.value };
      }

      const key = makeNodeKey(treeIndex, path);
      const parsed = parsePotentialBooleanCondition(node.condition);
      let condition = node.condition;

      if (parsed && decisions[key]) {
        condition = parsed.operator === '<='
          ? `${parsed.feature} is No`
          : `${parsed.feature} is Yes`;
      }

      return {
        condition,
        true_branch: transform(node.true_branch, `${path}.T`),
        false_branch: transform(node.false_branch, `${path}.F`),
      };
    };

    return {
      title: tree.title,
      root: transform(tree.root, 'root'),
    };
  });
}
