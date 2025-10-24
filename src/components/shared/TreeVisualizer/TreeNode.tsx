import type { TreeNode } from '@/lib/types/tree';
import { isLeafNode } from '@/lib/types/tree';

function getColorForValue(value: number, min: number, max: number): string {
  if (max === min) return `hsl(60, 70%, 45%)`;
  const normalized = (value - min) / (max - min);
  const hue = (1 - normalized) * 120; // 0 (red) to 120 (green)
  return `hsl(${hue}, 70%, 45%)`;
}

interface TreeNodeProps {
  node: TreeNode;
  isRoot?: boolean;
  minValue: number;
  maxValue: number;
}

export function TreeNodeComponent({ node, isRoot = false, minValue, maxValue }: TreeNodeProps) {
  const isLeaf = isLeafNode(node);

  // Build classes - always show at full opacity for preview
  const classes = ['preview-mode'];
  if (isLeaf) classes.push('leaf');
  if (isRoot) classes.push('root');

  if (isLeaf) {
    const color = getColorForValue(node.value, minValue, maxValue);

    return (
      <li className={classes.join(' ')}>
        <span
          className="report-node-content"
          style={{ backgroundColor: color }}
        >
          {node.value >= 0 ? '+' : ''}{node.value.toFixed(3)}
        </span>
      </li>
    );
  }

  return (
    <li className={classes.join(' ')}>
      <span className="report-node-content">
        {node.condition}
      </span>
      <ul>
        <TreeNodeComponent node={node.true_branch} minValue={minValue} maxValue={maxValue} />
        <TreeNodeComponent node={node.false_branch} minValue={minValue} maxValue={maxValue} />
      </ul>
    </li>
  );
}
