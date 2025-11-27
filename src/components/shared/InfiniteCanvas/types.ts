import type { Node, Edge } from '@xyflow/react';

// Custom node data types
export interface RootNodeData {
  label: string;
  condition: string;
  [key: string]: unknown;
}

export interface DecisionNodeData {
  condition: string;
  featureName: string;
  [key: string]: unknown;
}

export interface LeafNodeData {
  value: number;
  color: string;
  [key: string]: unknown;
}

// Node types for React Flow
export type TreeNodeType = 'root' | 'decision' | 'leaf';

export type RootNode = Node<RootNodeData, 'root'>;
export type DecisionNodeRF = Node<DecisionNodeData, 'decision'>;
export type LeafNodeRF = Node<LeafNodeData, 'leaf'>;

export type TreeFlowNode = RootNode | DecisionNodeRF | LeafNodeRF;

// Edge with label
export interface TreeEdge extends Edge {
  data?: {
    label: string;
  };
}

// Canvas props
export interface InfiniteCanvasProps {
  nodes: TreeFlowNode[];
  edges: TreeEdge[];
  className?: string;
  onNodeClick?: (nodeId: string) => void;
}

// Zoom toolbar props
export interface ZoomToolbarProps {
  className?: string;
}
