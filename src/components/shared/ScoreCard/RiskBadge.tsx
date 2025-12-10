import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  riskLevel: 'low' | 'moderate' | 'high';
  size?: 'xs' | 'sm' | 'default' | 'lg';
}

const riskConfig = {
  low: {
    icon: CheckCircle2,
    label: 'STP',
    className: 'bg-green-500/20 text-green-400 border-green-500/50',
  },
  moderate: {
    icon: AlertCircle,
    label: 'Moderate',
    className: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  },
  high: {
    icon: AlertTriangle,
    label: 'High',
    className: 'bg-red-500/20 text-red-400 border-red-500/50',
  },
};

export function RiskBadge({ riskLevel, size = 'default' }: RiskBadgeProps) {
  const config = riskConfig[riskLevel];
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px] gap-1',
    sm: 'px-2.5 py-1 text-xs gap-1',
    default: 'px-3 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-1.5',
  };

  const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-3.5 w-3.5',
    default: 'h-4 w-4',
    lg: 'h-4 w-4',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        sizeClasses[size],
        config.className
      )}
    >
      <Icon className={iconSizes[size]} />
      {config.label}
    </span>
  );
}
