import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

interface RiskBadgeProps {
  riskLevel: 'low' | 'moderate' | 'high';
  size?: 'xs' | 'sm' | 'default' | 'lg';
}

const riskConfig = {
  low: {
    variant: 'secondary' as const,
    icon: CheckCircle2,
    label: 'Low Risk',
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
  moderate: {
    variant: 'secondary' as const,
    icon: AlertCircle,
    label: 'Moderate Risk',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  },
  high: {
    variant: 'destructive' as const,
    icon: AlertTriangle,
    label: 'High Risk',
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
};

export function RiskBadge({ riskLevel, size = 'default' }: RiskBadgeProps) {
  const config = riskConfig[riskLevel];
  const Icon = config.icon;

  const iconSize = size === 'xs' ? 'h-4 w-4' : size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
  const textSize = size === 'xs' ? 'text-[10px]' : size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';

  return (
    <Badge variant={config.variant} className={`${config.className} ${textSize} gap-1`}>
      <Icon className={iconSize} />
      {config.label}
    </Badge>
  );
}
