import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { DecisionNodeData } from '../types';

interface DecisionNodeProps {
  data: DecisionNodeData;
}

function DecisionNodeComponent({ data }: DecisionNodeProps) {
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
        className="rounded-md border px-4 py-3 min-w-[160px]"
        style={{
          backgroundColor: '#27272a',
          borderColor: '#3f3f46',
        }}
      >
        {/* Feature name */}
        <div
          className="font-mono text-sm font-medium text-center"
          style={{ color: '#fafafa' }}
        >
          {data.featureName}
        </div>
      </div>

      {/* Bottom handle for children */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!bg-zinc-500 !border-zinc-600 !w-2 !h-2"
      />
    </div>
  );
}

export const DecisionNode = memo(DecisionNodeComponent);
