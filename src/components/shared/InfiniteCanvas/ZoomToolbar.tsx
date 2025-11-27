import { memo } from 'react';
import { useReactFlow, useStore } from '@xyflow/react';
import { Minus, Plus, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const zoomSelector = (state: { transform: [number, number, number] }) => state.transform[2];

function ZoomToolbarComponent() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const zoom = useStore(zoomSelector);
  const zoomPercentage = Math.round(zoom * 100);

  return (
    <div
      className="absolute bottom-4 right-4 flex items-center gap-1 rounded-lg border px-2 py-1.5 shadow-lg"
      style={{
        backgroundColor: '#18181b',
        borderColor: '#3f3f46',
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 hover:bg-zinc-700"
        onClick={() => zoomOut()}
        title="Zoom out"
      >
        <Minus className="h-4 w-4" style={{ color: '#a1a1aa' }} />
      </Button>

      <div
        className="px-2 min-w-[50px] text-center font-mono text-sm"
        style={{ color: '#fafafa' }}
      >
        {zoomPercentage}%
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 hover:bg-zinc-700"
        onClick={() => zoomIn()}
        title="Zoom in"
      >
        <Plus className="h-4 w-4" style={{ color: '#a1a1aa' }} />
      </Button>

      <div className="w-px h-5 mx-1" style={{ backgroundColor: '#3f3f46' }} />

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 hover:bg-zinc-700"
        onClick={() => fitView({ padding: 0.2, duration: 300 })}
        title="Fit to screen"
      >
        <Maximize2 className="h-4 w-4" style={{ color: '#a1a1aa' }} />
      </Button>
    </div>
  );
}

export const ZoomToolbar = memo(ZoomToolbarComponent);
