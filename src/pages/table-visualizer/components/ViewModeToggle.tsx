import { BarChart3, Table2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewModeToggleProps {
  mode: 'analytics' | 'table';
  onChange: (mode: 'analytics' | 'table') => void;
}

export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-zinc-900 rounded p-1">
      <button
        onClick={() => onChange('analytics')}
        className={cn(
          'p-2 rounded transition-colors',
          mode === 'analytics'
            ? 'bg-zinc-700 text-zinc-100'
            : 'text-zinc-500 hover:text-zinc-300'
        )}
        title="Analytics View"
      >
        <BarChart3 className="h-4 w-4" />
      </button>

      <button
        onClick={() => onChange('table')}
        className={cn(
          'p-2 rounded transition-colors',
          mode === 'table'
            ? 'bg-zinc-700 text-zinc-100'
            : 'text-zinc-500 hover:text-zinc-300'
        )}
        title="Table View"
      >
        <Table2 className="h-4 w-4" />
      </button>
    </div>
  );
}
