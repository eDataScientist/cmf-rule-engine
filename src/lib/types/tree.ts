export type TreeType = 'medical' | 'motor';

export interface LeafNode {
  value: number;
}

export interface DecisionNode {
  condition: string;
  true_branch: TreeNode;
  false_branch: TreeNode;
}

export type TreeNode = LeafNode | DecisionNode;

export function isLeafNode(node: TreeNode): node is LeafNode {
  return 'value' in node;
}

export function isDecisionNode(node: TreeNode): node is DecisionNode {
  return 'condition' in node;
}

export interface Tree {
  id: string;
  name: string;
  treeType: TreeType;
  structure: {
    title: string;
    root: TreeNode;
  }[];
  createdAt: Date;
}

export interface TreeMetadata {
  id: string;
  name: string;
  treeType: TreeType;
  treeCount: number;
  createdAt: Date;
}
