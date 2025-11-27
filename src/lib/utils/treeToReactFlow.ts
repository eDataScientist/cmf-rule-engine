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

  // Calculate positions using binary tree layout
  const calculatePositions = (
    node: TreeNode,
    level: number,
    minX: number,
    maxX: number,
    isRoot: boolean = false
  ): string => {
    const id = generateId();
    const x = (minX + maxX) / 2;
    const y = level * 150;

    positions.push({ id, x: x + offsetX, y: y + offsetY, level, node, isRoot });

    if (isDecisionNode(node)) {
      const decisionNode = node as DecisionNode;
      const midX = (minX + maxX) / 2;

      // Left branch (true) goes to left half
      const leftChildId = calculatePositions(
        decisionNode.true_branch,
        level + 1,
        minX,
        midX,
        false
      );

      // Right branch (false) goes to right half
      const rightChildId = calculatePositions(
        decisionNode.false_branch,
        level + 1,
        midX,
        maxX,
        false
      );

      // Create edges with labels
      const parsed = parseCondition(decisionNode.condition);

      edges.push({
        id: `edge-${id}-${leftChildId}`,
        source: id,
        target: leftChildId,
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
        id: `edge-${id}-${rightChildId}`,
        source: id,
        target: rightChildId,
        sourceHandle: 'bottom',
        targetHandle: 'top',
        type: 'smoothstep',
        label: parsed ? formatFalseLabel(parsed) : 'No',
        labelStyle: { fill: '#a1a1aa', fontSize: 11, fontWeight: 500 },
        labelBgStyle: { fill: '#1a1a1a', fillOpacity: 0.9 },
        labelBgPadding: [4, 2] as [number, number],
        labelBgBorderRadius: 4,
      });
    }

    return id;
  };

  // Start calculation
  calculatePositions(root, 0, 0, 800, true);

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

  const treeWidth = 900;  // Estimated width per tree cell
  const treeHeight = 800; // Estimated height per tree cell

  for (let treeIndex = 0; treeIndex < trees.length; treeIndex++) {
    const tree = trees[treeIndex];

    // Calculate grid position
    const col = treeIndex % columnsPerRow;
    const row = Math.floor(treeIndex / columnsPerRow);

    const offsetX = col * treeWidth;
    const offsetY = row * treeHeight;

    const { nodes, edges } = treeToReactFlow(
      tree.root,
      tree.title,
      offsetX,
      offsetY,
      `tree${treeIndex}`
    );

    allNodes.push(...nodes);
    allEdges.push(...edges);
  }

  return { nodes: allNodes, edges: allEdges };
}
