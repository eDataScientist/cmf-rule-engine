import { FileText, Receipt, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { DatasetGranularity } from '@/lib/db/types';

interface GranularityBadgeProps {
  granularity: DatasetGranularity;
  className?: string;
}

export default function GranularityBadge({ granularity, className }: GranularityBadgeProps) {
  const config = {
    claim: {
      icon: FileText,
      label: 'Claim',
      colorClass: 'border-green-500/50 bg-green-500/10 text-green-400',
    },
    invoice: {
      icon: Receipt,
      label: 'Invoice',
      colorClass: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400',
    },
    item: {
      icon: Package,
      label: 'Item',
      colorClass: 'border-purple-500/50 bg-purple-500/10 text-purple-400',
    },
  };

  const { icon: Icon, label, colorClass } = config[granularity];

  return (
    <Badge variant="outline" className={`flex items-center gap-1.5 ${colorClass} ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );
}
