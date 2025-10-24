import type { TreeNode } from '@/lib/types/tree';
import { isLeafNode } from '@/lib/types/tree';
import { TreeNodeComponent } from './TreeNode';
import { useMemo } from 'react';
import './styles.css';

interface TreeVisualizerProps {
  trees: { title: string; root: TreeNode }[];
}

function getMinMaxLeafValues(trees: { title: string; root: TreeNode }[]): { min: number; max: number } {
  const values: number[] = [];

  function traverse(node: TreeNode) {
    if (isLeafNode(node)) {
      values.push(node.value);
      return;
    }
    traverse(node.true_branch);
    traverse(node.false_branch);
  }

  trees.forEach(tree => traverse(tree.root));

  return {
    min: Math.min(...values),
    max: Math.max(...values)
  };
}

export function TreeVisualizer({ trees }: TreeVisualizerProps) {
  const { min, max } = useMemo(() => getMinMaxLeafValues(trees), [trees]);

  return (
    <div className="flex flex-wrap gap-4">
      {trees.map((tree, index) => (
        <div key={index} className="report-tree-card">
          <div className="report-tree-title">{tree.title}</div>
          <ul className="report-tree">
            <TreeNodeComponent node={tree.root} isRoot minValue={min} maxValue={max} />
          </ul>
        </div>
      ))}
    </div>
  );
}
