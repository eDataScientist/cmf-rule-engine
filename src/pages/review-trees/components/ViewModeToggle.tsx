import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ViewModeToggleProps {
  mode: 'grid' | 'list';
  onChange: (mode: 'grid' | 'list') => void;
}

export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange('list')}
        className={cn(
          'gap-2 px-3',
          mode === 'list'
            ? 'bg-zinc-800 text-white'
            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
        )}
      >
        <List className="h-4 w-4" />
        List
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange('grid')}
        className={cn(
          'gap-2 px-3',
          mode === 'grid'
            ? 'bg-zinc-800 text-white'
            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        Grid
      </Button>
    </div>
  );
}
