import type { TreeNode } from '@/lib/types/tree';
import { TreeNodeComponent } from './TreeNode';
import { useMemo } from 'react';
import './styles.css';
import { getMinMaxLeafValues } from './utils';

interface TreeVisualizerProps {
  trees: { title: string; root: TreeNode }[];
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
