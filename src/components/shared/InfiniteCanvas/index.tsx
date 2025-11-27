import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  MiniMap,
  useNodesState,
  useEdgesState,
  type DefaultEdgeOptions,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { RootNode, DecisionNode, LeafNode } from './nodes';
import { ZoomToolbar } from './ZoomToolbar';
import type { TreeFlowNode, TreeEdge } from './types';

// Define custom node types
const nodeTypes = {
  root: RootNode,
  decision: DecisionNode,
  leaf: LeafNode,
};

// Default edge options for 90-degree connectors
const defaultEdgeOptions: DefaultEdgeOptions = {
  type: 'smoothstep',
  style: {
    stroke: '#52525b',
    strokeWidth: 2,
  },
};

interface InfiniteCanvasProps {
  initialNodes: TreeFlowNode[];
  initialEdges: TreeEdge[];
  className?: string;
}

function InfiniteCanvasInner({
  initialNodes,
  initialEdges,
  className = '',
}: InfiniteCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<TreeEdge>([]);

  // Update nodes and edges when props change
  useEffect(() => {
    setNodes(initialNodes as Node[]);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Minimap node color function
  const nodeColor = useCallback((node: Node) => {
    switch (node.type) {
      case 'root':
        return '#3b82f6';
      case 'decision':
        return '#3f3f46';
      case 'leaf':
        return (node.data as { color?: string })?.color || '#22c55e';
      default:
        return '#3f3f46';
    }
  }, []);

  return (
    <div
      className={`${className}`}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#1a1a1a', // Charcoal grey
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        panOnScroll
        selectionOnDrag={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        {/* Dot grid background */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#2a2a2a"
        />

        {/* Minimap in top-right corner */}
        <MiniMap
          nodeColor={nodeColor}
          maskColor="rgba(0, 0, 0, 0.8)"
          style={{
            backgroundColor: '#18181b',
            border: '1px solid #3f3f46',
            width: 150,
            height: 100,
          }}
          className="!right-4 !top-4"
          pannable
          zoomable
        />

        {/* Zoom controls */}
        <ZoomToolbar />
      </ReactFlow>
    </div>
  );
}

export function InfiniteCanvas(props: InfiniteCanvasProps) {
  return (
    <ReactFlowProvider>
      <InfiniteCanvasInner {...props} />
    </ReactFlowProvider>
  );
}

export default InfiniteCanvas;
