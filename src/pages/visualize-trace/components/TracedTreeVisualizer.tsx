import type { TreeNode } from '@/lib/types/tree';
import type { TreePath } from '@/lib/types/trace';
import { isLeafNode } from '@/lib/types/tree';
import { useMemo } from 'react';
import '../../../components/shared/TreeVisualizer/styles.css';
import {
  parseCondition,
  formatTrueLabel,
  formatFalseLabel,
  getMinMaxLeafValues,
} from '@/components/shared/TreeVisualizer/utils';

function getColorForValue(value: number, min: number, max: number): string {
  if (max === min) return `hsl(60, 70%, 45%)`;
  const normalized = (value - min) / (max - min);
  const hue = (1 - normalized) * 120; // 0 (red) to 120 (green)
  return `hsl(${hue}, 70%, 45%)`;
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
  const isLeaf = isLeafNode(node);
  const isOnPath = pathSet.has(nodeId);

  if (isLeaf) {
    const classes = ['leaf'];
    if (isOnPath) {
      classes.push('path-active');
      classes.push('active');
    }

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

  const parsed = parseCondition(node.condition);
  const featureLabel = parsed ? parsed.feature : node.condition;
  const classes = [] as string[];
  if (isRoot) classes.push('root');
  if (isOnPath) {
    classes.push('path-active');
    classes.push('active');
  }

  const trueBranchId = `${nodeId}-1`;
  const falseBranchId = `${nodeId}-2`;
  const trueOnPath = pathSet.has(trueBranchId);
  const falseOnPath = pathSet.has(falseBranchId);

  if (!parsed) {
    return (
      <li id={nodeId} className={classes.join(' ')}>
        <span className="report-node-content">{featureLabel}</span>
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

  return (
    <li id={nodeId} className={classes.join(' ')}>
      <span className="report-node-content">{featureLabel}</span>
      <ul>
        <li className={trueOnPath ? 'path-active active' : undefined}>
          <span className="report-node-content">{formatTrueLabel(parsed)}</span>
          <ul>
            <TracedTreeNode
              node={node.true_branch}
              nodeId={trueBranchId}
              pathSet={pathSet}
              minValue={minValue}
              maxValue={maxValue}
            />
          </ul>
        </li>
        <li className={falseOnPath ? 'path-active active' : undefined}>
          <span className="report-node-content">{formatFalseLabel(parsed)}</span>
          <ul>
            <TracedTreeNode
              node={node.false_branch}
              nodeId={falseBranchId}
              pathSet={pathSet}
              minValue={minValue}
              maxValue={maxValue}
            />
          </ul>
        </li>
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
    <div
      className="min-h-full p-6"
      style={{
        backgroundColor: '#09090b',
        backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
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
    </div>
  );
}
