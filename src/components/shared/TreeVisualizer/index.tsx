import type { TreeNode } from '@/lib/types/tree';
import { TreeNodeComponent } from './TreeNode';
import './styles.css';

interface TreeVisualizerProps {
  trees: { title: string; root: TreeNode }[];
}

export function TreeVisualizer({ trees }: TreeVisualizerProps) {
  return (
    <div className="flex flex-wrap gap-4">
      {trees.map((tree, index) => (
        <div key={index} className="report-tree-card">
          <div className="report-tree-title">{tree.title}</div>
          <ul className="report-tree">
            <TreeNodeComponent node={tree.root} isRoot />
          </ul>
        </div>
      ))}
    </div>
  );
}
