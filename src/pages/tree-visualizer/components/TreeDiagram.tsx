import { useMemo } from 'react';
import { isLeafNode, isDecisionNode } from '@/lib/types/tree';
import type { TreeNode, DecisionNode } from '@/lib/types/tree';
import {
  parseCondition,
  formatTrueLabel,
  formatFalseLabel,
  getMinMaxLeafValues,
} from '@/components/shared/TreeVisualizer/utils';

interface TreeDiagramProps {
  root: TreeNode;
  title: string;
}

interface NodePosition {
  node: TreeNode;
  x: number;
  y: number;
  level: number;
  isLeft?: boolean;
}

function getColorForValue(value: number, min: number, max: number): string {
  if (max === min) return `hsl(60, 70%, 45%)`;
  const normalized = (value - min) / (max - min);
  const hue = (1 - normalized) * 120; // 0 (red) to 120 (green)
  return `hsl(${hue}, 70%, 45%)`;
}

export function TreeDiagram({ root, title }: TreeDiagramProps) {
  // Calculate min/max for color coding
  const { min, max } = useMemo(() => getMinMaxLeafValues([{ title, root }]), [root, title]);

  // Calculate positions for all nodes with horizontal spreading
  const positions: NodePosition[] = [];

  const calculatePositions = (
    node: TreeNode,
    level: number,
    minX: number,
    maxX: number,
    isLeft?: boolean
  ) => {
    const x = (minX + maxX) / 2;
    const y = level * 150;

    positions.push({ node, x, y, level, isLeft });

    if (isDecisionNode(node)) {
      const decisionNode = node as DecisionNode;
      const midX = (minX + maxX) / 2;

      // Left branch (true) goes to left half
      calculatePositions(decisionNode.true_branch, level + 1, minX, midX, true);

      // Right branch (false) goes to right half
      calculatePositions(decisionNode.false_branch, level + 1, midX, maxX, false);
    }
  };

  calculatePositions(root, 0, 0, 1200);

  // Calculate SVG dimensions with proper padding
  const maxY = Math.max(...positions.map((p) => p.y)) + 120;
  const minX = Math.min(...positions.map((p) => p.x)) - 150;
  const maxX = Math.max(...positions.map((p) => p.x)) + 150;
  const width = maxX - minX;
  const minY = -40; // Add padding at the top
  const height = maxY - minY;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/75 backdrop-blur p-8 shadow-xl">
      <div className="pointer-events-none absolute -right-24 top-[-90px] h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-[-120px] h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />

      <div className="relative">
        <h3 className="text-xl font-semibold text-slate-900 mb-6">{title}</h3>

        <div className="overflow-x-auto">
          <svg
            width={width}
            height={height}
            viewBox={`${minX} ${minY} ${width} ${height}`}
            className="mx-auto"
            style={{ fontFamily: "'Fira Code', ui-monospace, monospace" }}
          >
            {/* Draw connecting lines with 90-degree angles */}
            {positions.map((pos, idx) => {
              if (isDecisionNode(pos.node)) {
                const decisionNode = pos.node as DecisionNode;

                // Find children positions
                const leftChild = positions.find(
                  (p) => p.node === decisionNode.true_branch && p.level === pos.level + 1
                );
                const rightChild = positions.find(
                  (p) => p.node === decisionNode.false_branch && p.level === pos.level + 1
                );

                const parsed = parseCondition(decisionNode.condition);

                return (
                  <g key={`lines-${idx}`}>
                    {leftChild && (
                      <g>
                        {/* Vertical line down */}
                        <line
                          x1={pos.x}
                          y1={pos.y + 18}
                          x2={pos.x}
                          y2={pos.y + 75}
                          stroke="#18181b"
                          strokeWidth="2"
                        />
                        {/* Horizontal line to left */}
                        <line
                          x1={pos.x}
                          y1={pos.y + 75}
                          x2={leftChild.x}
                          y2={pos.y + 75}
                          stroke="#18181b"
                          strokeWidth="2"
                        />
                        {/* Vertical line up to child */}
                        <line
                          x1={leftChild.x}
                          y1={pos.y + 75}
                          x2={leftChild.x}
                          y2={leftChild.y - 18}
                          stroke="#18181b"
                          strokeWidth="2"
                        />
                        {/* Label */}
                        <text
                          x={leftChild.x}
                          y={pos.y + 65}
                          textAnchor="middle"
                          fill="#0f172a"
                          fontSize="12"
                          fontWeight="500"
                        >
                          {parsed ? formatTrueLabel(parsed) : 'True'}
                        </text>
                      </g>
                    )}
                    {rightChild && (
                      <g>
                        {/* Vertical line down */}
                        <line
                          x1={pos.x}
                          y1={pos.y + 18}
                          x2={pos.x}
                          y2={pos.y + 75}
                          stroke="#18181b"
                          strokeWidth="2"
                        />
                        {/* Horizontal line to right */}
                        <line
                          x1={pos.x}
                          y1={pos.y + 75}
                          x2={rightChild.x}
                          y2={pos.y + 75}
                          stroke="#18181b"
                          strokeWidth="2"
                        />
                        {/* Vertical line up to child */}
                        <line
                          x1={rightChild.x}
                          y1={pos.y + 75}
                          x2={rightChild.x}
                          y2={rightChild.y - 18}
                          stroke="#18181b"
                          strokeWidth="2"
                        />
                        {/* Label */}
                        <text
                          x={rightChild.x}
                          y={pos.y + 65}
                          textAnchor="middle"
                          fill="#0f172a"
                          fontSize="12"
                          fontWeight="500"
                        >
                          {parsed ? formatFalseLabel(parsed) : 'False'}
                        </text>
                      </g>
                    )}
                  </g>
                );
              }
              return null;
            })}

            {/* Draw nodes */}
            {positions.map((pos, idx) => {
              const isRoot = pos.level === 0;

              if (isLeafNode(pos.node)) {
                // Leaf node - color coded by value
                const value = pos.node.value;
                const color = getColorForValue(value, min, max);

                return (
                  <g key={`node-${idx}`}>
                    <rect
                      x={pos.x - 50}
                      y={pos.y - 18}
                      width={100}
                      height={36}
                      rx={4}
                      fill={color}
                      stroke="transparent"
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 5}
                      textAnchor="middle"
                      fill="white"
                      fontSize="12"
                      fontWeight="600"
                    >
                      {value >= 0 ? '+' : ''}{value.toFixed(3)}
                    </text>
                  </g>
                );
              } else if (isDecisionNode(pos.node)) {
                // Decision node - show feature name
                const decisionNode = pos.node as DecisionNode;
                const parsed = parseCondition(decisionNode.condition);
                const featureLabel = parsed ? parsed.feature : decisionNode.condition;

                // Root nodes get special styling
                const bgColor = isRoot ? '#e0e7ff' : '#f4f4f5';

                return (
                  <g key={`node-${idx}`}>
                    <rect
                      x={pos.x - 70}
                      y={pos.y - 18}
                      width={140}
                      height={36}
                      rx={4}
                      fill={bgColor}
                      stroke="#e4e4e7"
                      strokeWidth="1"
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 5}
                      textAnchor="middle"
                      fill="#0f172a"
                      fontSize="12"
                      fontWeight={isRoot ? '600' : '500'}
                    >
                      {featureLabel}
                    </text>
                  </g>
                );
              }
              return null;
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
