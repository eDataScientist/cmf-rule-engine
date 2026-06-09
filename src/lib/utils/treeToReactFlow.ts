import type { TreeNode, DecisionNode } from '@/lib/types/tree';
import { isLeafNode, isDecisionNode } from '@/lib/types/tree';
import {
  parseCondition,
  formatTrueLabel,
  formatFalseLabel,
  getMinMaxLeafValues,
} from '@/components/shared/TreeVisualizer/utils';
import type { TreeFlowNode, TreeEdge } from '@/components/shared/InfiniteCanvas/types';

// Get color for leaf value based on min/max range
function getColorForValue(value: number, min: number, max: number): string {
  if (max === min) return 'hsl(60, 70%, 35%)';
  const normalized = (value - min) / (max - min);
  // Red (negative) to Green (positive)
  const hue = normalized * 120; // 0 (red) to 120 (green)
  return `hsl(${hue}, 70%, 35%)`;
}

interface ConversionResult {
  nodes: TreeFlowNode[];
  edges: TreeEdge[];
}

interface PositionInfo {
  id: string;
  x: number;
  y: number;
  level: number;
  node: TreeNode;
  isRoot: boolean;
}

const LevelHeight = 150;
const NodeEdgeGap = 120;
const LeafNodeWidth = 80;
const DecisionNodeMinWidth = 160;
const RootNodeMinWidth = 180;
const NodeHorizontalPadding = 32;
const MonospaceCharacterWidth = 8;
const TreeColumnGap = 120;
const TreeRowGap = 160;

interface RelativePositionInfo {
  id: string;
  centerX: number;
  y: number;
  level: number;
  node: TreeNode;
  isRoot: boolean;
  width: number;
}

interface ContourBounds {
  left: number;
  right: number;
}

interface SubtreeLayout {
  rootId: string;
  rootCenterX: number;
  positions: RelativePositionInfo[];
  contours: Map<number, ContourBounds>;
}

function getTextNodeWidth(label: string, minWidth: number): number {
  return Math.max(minWidth, label.length * MonospaceCharacterWidth + NodeHorizontalPadding);
}

function getEstimatedTreeNodeWidth(node: TreeNode, isRoot: boolean): number {
  if (isLeafNode(node)) return LeafNodeWidth;

  const parsed = parseCondition(node.condition);
  const label = parsed ? parsed.feature : node.condition;
  return getTextNodeWidth(label, isRoot ? RootNodeMinWidth : DecisionNodeMinWidth);
}

function getEstimatedFlowNodeWidth(node: TreeFlowNode): number {
  if (node.type === 'leaf') return LeafNodeWidth;
  if (node.type === 'root') return getTextNodeWidth(node.data.condition, RootNodeMinWidth);
  return getTextNodeWidth(node.data.featureName, DecisionNodeMinWidth);
}

function mergeContour(
  contours: Map<number, ContourBounds>,
  level: number,
  bounds: ContourBounds
) {
  const existing = contours.get(level);
  if (!existing) {
    contours.set(level, { ...bounds });
    return;
  }

  existing.left = Math.min(existing.left, bounds.left);
  existing.right = Math.max(existing.right, bounds.right);
}

function getRequiredShift(left: Map<number, ContourBounds>, right: Map<number, ContourBounds>) {
  let shift = 0;

  for (const [level, leftBounds] of left) {
    const rightBounds = right.get(level);
    if (!rightBounds) continue;

    shift = Math.max(shift, leftBounds.right + NodeEdgeGap - rightBounds.left);
  }

  return shift;
}

function shiftPosition(position: RelativePositionInfo, shift: number): RelativePositionInfo {
  return { ...position, centerX: position.centerX + shift };
}

export function treeToReactFlow(
  root: TreeNode,
  title: string = 'Tree',
  offsetX: number = 0,
  offsetY: number = 0,
  idPrefix: string = 'tree0'
): ConversionResult {
  const nodes: TreeFlowNode[] = [];
  const edges: TreeEdge[] = [];
  const positions: PositionInfo[] = [];

  // Get min/max for color coding
  const { min, max } = getMinMaxLeafValues([{ title, root }]);

  let nodeIdCounter = 0;
  const generateId = () => `${idPrefix}-node-${nodeIdCounter++}`;

  // Pack sibling subtrees by their visible contours instead of reserving
  // equal slots for every leaf. This keeps deep sparse trees compact while
  // preserving a readable edge gap at every overlapping level.
  const layoutSubtree = (
    node: TreeNode,
    level: number,
    isRoot: boolean = false
  ): SubtreeLayout => {
    const id = generateId();
    const y = level * LevelHeight;
    const width = getEstimatedTreeNodeWidth(node, isRoot);
    const halfWidth = width / 2;

    if (isLeafNode(node)) {
      return {
        rootId: id,
        rootCenterX: 0,
        positions: [{ id, centerX: 0, y, level, node, isRoot, width }],
        contours: new Map([[0, { left: -halfWidth, right: halfWidth }]]),
      };
    }

    const decisionNode = node as DecisionNode;

    const leftChild = layoutSubtree(decisionNode.true_branch, level + 1, false);
    const rightChild = layoutSubtree(decisionNode.false_branch, level + 1, false);
    const rightShift = getRequiredShift(leftChild.contours, rightChild.contours);
    const shiftedRightPositions = rightChild.positions.map((position) =>
      shiftPosition(position, rightShift)
    );
    const rootCenterX = (leftChild.rootCenterX + rightChild.rootCenterX + rightShift) / 2;
    const contours = new Map<number, ContourBounds>([
      [0, { left: rootCenterX - halfWidth, right: rootCenterX + halfWidth }],
    ]);

    for (const [contourLevel, bounds] of leftChild.contours) {
      mergeContour(contours, contourLevel + 1, bounds);
    }

    for (const [contourLevel, bounds] of rightChild.contours) {
      mergeContour(contours, contourLevel + 1, {
        left: bounds.left + rightShift,
        right: bounds.right + rightShift,
      });
    }

    // Create edges with labels
    const parsed = parseCondition(decisionNode.condition);

    edges.push({
      id: `edge-${id}-${leftChild.rootId}`,
      source: id,
      target: leftChild.rootId,
      sourceHandle: 'bottom',
      targetHandle: 'top',
      type: 'smoothstep',
      label: parsed ? formatTrueLabel(parsed) : 'Yes',
      labelStyle: { fill: '#a1a1aa', fontSize: 11, fontWeight: 500 },
      labelBgStyle: { fill: '#1a1a1a', fillOpacity: 0.9 },
      labelBgPadding: [4, 2] as [number, number],
      labelBgBorderRadius: 4,
    });

    edges.push({
      id: `edge-${id}-${rightChild.rootId}`,
      source: id,
      target: rightChild.rootId,
      sourceHandle: 'bottom',
      targetHandle: 'top',
      type: 'smoothstep',
      label: parsed ? formatFalseLabel(parsed) : 'No',
      labelStyle: { fill: '#a1a1aa', fontSize: 11, fontWeight: 500 },
      labelBgStyle: { fill: '#1a1a1a', fillOpacity: 0.9 },
      labelBgPadding: [4, 2] as [number, number],
      labelBgBorderRadius: 4,
    });

    return {
      rootId: id,
      rootCenterX,
      positions: [
        ...leftChild.positions,
        ...shiftedRightPositions,
        { id, centerX: rootCenterX, y, level, node, isRoot, width },
      ],
      contours,
    };
  };

  const layout = layoutSubtree(root, 0, true);
  const minLeft = Math.min(...Array.from(layout.contours.values()).map((bounds) => bounds.left));

  for (const pos of layout.positions) {
    positions.push({
      id: pos.id,
      x: pos.centerX - pos.width / 2 - minLeft + offsetX,
      y: pos.y + offsetY,
      level: pos.level,
      node: pos.node,
      isRoot: pos.isRoot,
    });
  }

  // Convert positions to React Flow nodes
  for (const pos of positions) {
    if (isLeafNode(pos.node)) {
      const value = pos.node.value;
      const color = getColorForValue(value, min, max);

      nodes.push({
        id: pos.id,
        type: 'leaf',
        position: { x: pos.x, y: pos.y },
        data: { value, color },
      });
    } else if (isDecisionNode(pos.node)) {
      const decisionNode = pos.node as DecisionNode;
      const parsed = parseCondition(decisionNode.condition);
      const featureName = parsed ? parsed.feature : decisionNode.condition;

      if (pos.isRoot) {
        nodes.push({
          id: pos.id,
          type: 'root',
          position: { x: pos.x, y: pos.y },
          data: {
            label: 'Root Split',
            condition: featureName,
          },
        });
      } else {
        nodes.push({
          id: pos.id,
          type: 'decision',
          position: { x: pos.x, y: pos.y },
          data: {
            condition: decisionNode.condition,
            featureName,
          },
        });
      }
    }
  }

  return { nodes, edges };
}

// Convert multiple trees (ensemble) to React Flow format
// Arranges trees in a grid layout for better visibility
export function treesToReactFlow(
  trees: { title: string; root: TreeNode }[],
  columnsPerRow: number = 3
): ConversionResult {
  const allNodes: TreeFlowNode[] = [];
  const allEdges: TreeEdge[] = [];
  let offsetX = 0;
  let offsetY = 0;
  let rowHeight = 0;

  for (let treeIndex = 0; treeIndex < trees.length; treeIndex++) {
    const tree = trees[treeIndex];

    const col = treeIndex % columnsPerRow;
    if (col === 0 && treeIndex > 0) {
      offsetX = 0;
      offsetY += rowHeight + TreeRowGap;
      rowHeight = 0;
    }

    const { nodes, edges } = treeToReactFlow(
      tree.root,
      tree.title,
      offsetX,
      offsetY,
      `tree${treeIndex}`
    );

    allNodes.push(...nodes);
    allEdges.push(...edges);

    const treeRight = Math.max(...nodes.map((node) => node.position.x + getEstimatedFlowNodeWidth(node)));
    const treeBottom = Math.max(...nodes.map((node) => node.position.y)) + LevelHeight;
    offsetX = treeRight + TreeColumnGap;
    rowHeight = Math.max(rowHeight, treeBottom - offsetY);
  }

  return { nodes: allNodes, edges: allEdges };
}
