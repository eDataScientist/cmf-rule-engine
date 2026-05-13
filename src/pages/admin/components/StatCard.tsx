import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
}

export function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {title}
            </p>
            <p className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              {value}
            </p>
            {description && (
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {description}
              </p>
            )}
          </div>
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{ backgroundColor: 'var(--color-bg-app)' }}
          >
            <Icon className="h-6 w-6" style={{ color: 'var(--color-text-secondary)' }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
