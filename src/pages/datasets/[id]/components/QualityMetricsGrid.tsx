import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { QualityMetrics } from '../hooks/useQualityMetrics';

interface QualityMetricsGridProps {
  quality: QualityMetrics | null;
  loading: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-500';
}

function getProgressColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

export default function QualityMetricsGrid({ quality, loading }: QualityMetricsGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quality) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Quality metrics not available
      </div>
    );
  }

  const metrics = [
    { label: 'Overall Quality Score', value: quality.quality_score },
    { label: 'Completeness', value: quality.completeness_percentage },
    { label: 'Critical Completeness', value: quality.critical_completeness_percentage },
  ];

  return (
    <div className="grid grid-cols-3 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader>
            <p className="text-sm text-muted-foreground">{metric.label}</p>
          </CardHeader>
          <CardContent>
            <div className={`text-6xl font-mono font-bold ${getScoreColor(metric.value)}`}>
              {metric.value}%
            </div>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${getProgressColor(metric.value)}`}
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
