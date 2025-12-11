import { GitBranch, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalysisMode } from '@/store/atoms/tableVisualization';

interface AnalysisModeSelectorProps {
  value: AnalysisMode;
  onChange: (mode: AnalysisMode) => void;
  disabled?: boolean;
}

export function AnalysisModeSelector({ value, onChange, disabled }: AnalysisModeSelectorProps) {
  return (
    <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: '#27272a' }}>
      <button
        onClick={() => onChange('trees')}
        disabled={disabled}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors',
          value === 'trees'
            ? 'bg-zinc-800 text-zinc-100 shadow-sm'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <GitBranch className="h-3.5 w-3.5" />
        <span>Trees</span>
      </button>
      <button
        onClick={() => onChange('rules')}
        disabled={disabled}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors',
          value === 'rules'
            ? 'bg-zinc-800 text-zinc-100 shadow-sm'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <ListChecks className="h-3.5 w-3.5" />
        <span>Rules</span>
      </button>
    </div>
  );
}
