import { useAtom } from 'jotai';
import { AlertTriangle, XOctagon } from 'lucide-react';
import { ruleBuilderCurrentEffectAtom } from '@/store/atoms/ruleBuilder';
import type { RuleEffect } from '@/lib/types/ruleBuilder';

interface EffectSelectorProps {
  disabled?: boolean;
}

export function EffectSelector({ disabled }: EffectSelectorProps) {
  const [effect, setEffect] = useAtom(ruleBuilderCurrentEffectAtom);

  const handleSelect = (newEffect: RuleEffect) => {
    if (disabled) return;
    setEffect(newEffect);
  };

  return (
    <div className="flex gap-2">
      {/* Moderate Risk */}
      <button
        onClick={() => handleSelect('moderate')}
        disabled={disabled}
        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all ${
          effect === 'moderate'
            ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
            : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <AlertTriangle className="h-4 w-4" />
        <span className="text-xs font-medium">Moderate</span>
      </button>

      {/* High Risk */}
      <button
        onClick={() => handleSelect('high')}
        disabled={disabled}
        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all ${
          effect === 'high'
            ? 'bg-red-500/20 border-red-500/50 text-red-400'
            : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <XOctagon className="h-4 w-4" />
        <span className="text-xs font-medium">High</span>
      </button>
    </div>
  );
}
