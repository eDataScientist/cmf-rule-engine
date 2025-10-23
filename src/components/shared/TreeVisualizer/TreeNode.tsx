import type { TreeNode } from '@/lib/types/tree';
import { isLeafNode } from '@/lib/types/tree';

interface TreeNodeProps {
  node: TreeNode;
  isRoot?: boolean;
}

export function TreeNodeComponent({ node, isRoot = false }: TreeNodeProps) {
  const isLeaf = isLeafNode(node);

  return (
    <li className={`relative ${isRoot ? 'root' : ''} ${isLeaf ? 'leaf' : ''}`}>
      <span className="report-node-content">
        {isLeaf ? `Val: ${node.value}` : node.condition}
      </span>

      {!isLeaf && (
        <ul className="report-tree-list">
          {node.true_branch && <TreeNodeComponent node={node.true_branch} />}
          {node.false_branch && <TreeNodeComponent node={node.false_branch} />}
        </ul>
      )}
    </li>
  );
}
