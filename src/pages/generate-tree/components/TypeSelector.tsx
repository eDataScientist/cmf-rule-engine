import { Activity, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TreeType } from '@/lib/types/tree';

interface TypeSelectorProps {
  value: TreeType;
  onChange: (value: TreeType) => void;
}

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange('motor')}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all',
          value === 'motor'
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border bg-background hover:bg-secondary'
        )}
      >
        <Activity className="h-5 w-5" />
        <span className="font-medium">Motor Claims</span>
      </button>

      <button
        type="button"
        onClick={() => onChange('medical')}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all',
          value === 'medical'
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border bg-background hover:bg-secondary'
        )}
      >
        <Heart className="h-5 w-5" />
        <span className="font-medium">Medical Claims</span>
      </button>
    </div>
  );
}
