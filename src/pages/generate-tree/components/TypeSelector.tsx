import { Activity, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TreeType } from '@/lib/types/tree';

interface TypeSelectorProps {
  value: TreeType;
  onChange: (value: TreeType) => void;
}

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  return (
    <div className="flex gap-4">
      <button
        type="button"
        onClick={() => onChange('motor')}
        className={cn(
          'flex flex-1 items-center justify-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-6 py-4 text-slate-600 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-35px_rgba(59,130,246,0.45)]',
          value === 'motor'
            ? 'border-transparent bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400 text-white shadow-[0_22px_60px_-30px_rgba(14,116,144,0.55)]'
            : ''
        )}
      >
        <Activity className="h-5 w-5" />
        <span className="font-medium">Motor Claims</span>
      </button>

      <button
        type="button"
        onClick={() => onChange('medical')}
        className={cn(
          'flex flex-1 items-center justify-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-6 py-4 text-slate-600 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-35px_rgba(236,72,153,0.35)]',
          value === 'medical'
            ? 'border-transparent bg-gradient-to-r from-rose-500 via-rose-400 to-orange-300 text-white shadow-[0_22px_60px_-30px_rgba(236,72,153,0.45)]'
            : ''
        )}
      >
        <Heart className="h-5 w-5" />
        <span className="font-medium">Medical Claims</span>
      </button>
    </div>
  );
}
