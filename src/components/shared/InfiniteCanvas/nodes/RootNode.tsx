import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { RootNodeData } from '../types';

interface RootNodeProps {
  data: RootNodeData;
}

function RootNodeComponent({ data }: RootNodeProps) {
  return (
    <div className="relative">
      {/* Node container */}
      <div
        className="rounded-md border px-4 py-3 min-w-[180px]"
        style={{
          backgroundColor: '#27272a',
          borderColor: '#3f3f46',
        }}
      >
        {/* Root Split label */}
        <div
          className="text-[10px] font-medium uppercase tracking-wider mb-1"
          style={{ color: '#60a5fa' }}
        >
          Root Split
        </div>
        {/* Condition/Feature name */}
        <div
          className="font-mono text-sm font-medium"
          style={{ color: '#fafafa' }}
        >
          {data.condition}
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

export const RootNode = memo(RootNodeComponent);
