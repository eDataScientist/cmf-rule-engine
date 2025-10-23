import type { TreeNode } from '@/lib/types/tree';
import { isLeafNode } from '@/lib/types/tree';

export function validateTreeName(name: string): string | null {
  if (!name.trim()) {
    return 'Tree name is required';
  }
  if (name.length < 3) {
    return 'Tree name must be at least 3 characters';
  }
  if (name.length > 100) {
    return 'Tree name must be less than 100 characters';
  }
  return null;
}

export function validateTreeStructure(
  structure: { title: string; root: TreeNode }[]
): string | null {
  if (structure.length === 0) {
    return 'At least one tree is required';
  }

  for (const tree of structure) {
    if (!tree.title) {
      return 'All trees must have a title';
    }
    if (!tree.root) {
      return 'All trees must have a root node';
    }
  }

  return null;
}

export function countLeafNodes(node: TreeNode): number {
  if (isLeafNode(node)) {
    return 1;
  }

  return (
    countLeafNodes(node.true_branch) + countLeafNodes(node.false_branch)
  );
}
