import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { LeafNodeData } from '../types';

interface LeafNodeProps {
  data: LeafNodeData;
}

function LeafNodeComponent({ data }: LeafNodeProps) {
  const displayValue = data.value >= 0 ? `+${data.value.toFixed(3)}` : data.value.toFixed(3);

  return (
    <div className="relative">
      {/* Top handle for parent connection */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!bg-zinc-500 !border-zinc-600 !w-2 !h-2"
      />

      {/* Node container */}
      <div
        className="rounded-md border px-4 py-2 min-w-[80px]"
        style={{
          backgroundColor: data.color,
          borderColor: 'transparent',
        }}
      >
        {/* Value display */}
        <div
          className="font-mono text-sm font-semibold text-center"
          style={{ color: '#ffffff' }}
        >
          {displayValue}
        </div>
      </div>
    </div>
  );
}

export const LeafNode = memo(LeafNodeComponent);
