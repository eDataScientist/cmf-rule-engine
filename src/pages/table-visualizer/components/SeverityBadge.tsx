import { cn } from '@/lib/utils';
import type { RuleEffect } from '@/lib/types/ruleBuilder';

interface SeverityBadgeProps {
  severity: RuleEffect | null;
  size?: 'xs' | 'sm' | 'md';
}

const sizeClasses = {
  xs: 'text-[10px] px-1.5 py-0.5',
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
};

export function SeverityBadge({ severity, size = 'sm' }: SeverityBadgeProps) {
  if (!severity) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded font-medium',
          sizeClasses[size],
          'bg-zinc-700/50 text-zinc-400'
        )}
      >
        None
      </span>
    );
  }

  const colorClasses = severity === 'high'
    ? 'bg-red-500/20 text-red-400 border-red-500/30'
    : 'bg-orange-500/20 text-orange-400 border-orange-500/30';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded font-medium border',
        sizeClasses[size],
        colorClasses
      )}
    >
      {severity === 'high' ? 'High' : 'Moderate'}
    </span>
  );
}
