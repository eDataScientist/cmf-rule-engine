import type { TreeNode } from '@/lib/types/tree';
import { isLeafNode } from '@/lib/types/tree';

export interface FeatureInfo {
  name: string;
  type: 'number' | 'boolean';
  conditions: string[];
}

export function extractFeatures(trees: { title: string; root: TreeNode }[]): Map<string, FeatureInfo> {
  const featuresMap = new Map<string, FeatureInfo>();

  function traverse(node: TreeNode) {
    if (isLeafNode(node)) return;

    const condition = node.condition;

    // Extract feature name from condition
    const lteMatch = condition.match(/^(.+?)\s*<=\s*(.+)$/);
    const gtMatch = condition.match(/^(.+?)\s*>\s*(.+)$/);
    const isMatch = condition.match(/^(.+?)\s+is\s+(.+)$/);

    let featureName: string | null = null;
    let conditionType: 'number' | 'boolean' = 'number';

    if (lteMatch || gtMatch) {
      const match = lteMatch || gtMatch;
      featureName = match![1].trim();
      conditionType = 'number';
    } else if (isMatch) {
      featureName = isMatch[1].trim();
      conditionType = 'boolean';
    }

    if (featureName) {
      if (!featuresMap.has(featureName)) {
        featuresMap.set(featureName, {
          name: featureName,
          type: conditionType,
          conditions: [],
        });
      }
      featuresMap.get(featureName)!.conditions.push(condition);
    }

    // Recursively traverse branches
    traverse(node.true_branch);
    traverse(node.false_branch);
  }

  trees.forEach((tree) => traverse(tree.root));

  return featuresMap;
}
