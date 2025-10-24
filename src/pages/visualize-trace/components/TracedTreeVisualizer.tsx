import type { TreeNode } from '@/lib/types/tree';
import type { TreePath } from '@/lib/types/trace';
import { isLeafNode } from '@/lib/types/tree';
import { useMemo } from 'react';
import '../../../components/shared/TreeVisualizer/styles.css';

function getColorForValue(value: number, min: number, max: number): string {
  if (max === min) return `hsl(60, 70%, 45%)`;
  const normalized = (value - min) / (max - min);
  const hue = (1 - normalized) * 120; // 0 (red) to 120 (green)
  return `hsl(${hue}, 70%, 45%)`;
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

interface TracedTreeNodeProps {
  node: TreeNode;
  nodeId: string;
  isRoot?: boolean;
  pathSet: Set<string>;
  minValue: number;
  maxValue: number;
}

function TracedTreeNode({ node, nodeId, isRoot = false, pathSet, minValue, maxValue }: TracedTreeNodeProps) {
  const isOnPath = pathSet.has(nodeId);
  const isLeaf = isLeafNode(node);

  // Build classes
  const classes = [];
  if (isLeaf) classes.push('leaf');
  if (isRoot) classes.push('root');
  if (isOnPath) {
    classes.push('path-active');
    classes.push('active');
  }

  if (isLeaf) {
    const color = getColorForValue(node.value, minValue, maxValue);

    return (
      <li id={nodeId} className={classes.join(' ')}>
        <span
          className="report-node-content"
          style={{ backgroundColor: color }}
        >
          {node.value >= 0 ? '+' : ''}{node.value.toFixed(3)}
        </span>
      </li>
    );
  }

  // Decision node
  const trueBranchId = `${nodeId}-1`;
  const falseBranchId = `${nodeId}-2`;

  return (
    <li id={nodeId} className={classes.join(' ')}>
      <span className="report-node-content">
        {node.condition}
      </span>
      <ul>
        <TracedTreeNode
          node={node.true_branch}
          nodeId={trueBranchId}
          pathSet={pathSet}
          minValue={minValue}
          maxValue={maxValue}
        />
        <TracedTreeNode
          node={node.false_branch}
          nodeId={falseBranchId}
          pathSet={pathSet}
          minValue={minValue}
          maxValue={maxValue}
        />
      </ul>
    </li>
  );
}

interface TracedTreeVisualizerProps {
  trees: { title: string; root: TreeNode }[];
  paths: TreePath[];
}

export function TracedTreeVisualizer({ trees, paths }: TracedTreeVisualizerProps) {
  const { min, max } = useMemo(() => getMinMaxLeafValues(trees), [trees]);

  return (
    <div className="flex flex-wrap gap-4">
      {trees.map((tree, index) => {
        const treePath = paths.find((p) => p.treeIndex === index);
        const pathSet = new Set(treePath?.nodeIds || []);

        const rootId = `t${index}-root`;

        return (
          <div key={index} className="report-tree-card">
            <div className="report-tree-title">
              {tree.title}
              {treePath && (
                <span className="ml-2 text-sm font-mono">
                  {treePath.leafValue >= 0 ? '+' : ''}{treePath.leafValue.toFixed(3)}
                </span>
              )}
            </div>
            <ul className="report-tree">
              <TracedTreeNode
                node={tree.root}
                nodeId={rootId}
                isRoot
                pathSet={pathSet}
                minValue={min}
                maxValue={max}
              />
            </ul>
          </div>
        );
      })}
    </div>
  );
}
