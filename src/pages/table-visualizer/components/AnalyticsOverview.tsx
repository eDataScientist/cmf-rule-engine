import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TraceResult } from '@/lib/types/trace';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface AnalyticsOverviewProps {
  results: TraceResult[];
}

const BUCKET_COUNT = 10;

function buildDistribution(results: TraceResult[]) {
  const buckets = Array.from({ length: BUCKET_COUNT }, (_, index) => {
    const start = index * 10;
    const end = index === BUCKET_COUNT - 1 ? 100 : (index + 1) * 10;
    return {
      bucket: `${start}-${end}%`,
      count: 0,
    };
  });

  results.forEach((result) => {
    const percent = Math.max(0, Math.min(1, result.probability)) * 100;
    const bucketIndex = Math.min(BUCKET_COUNT - 1, Math.floor(percent / 10));
    buckets[bucketIndex].count += 1;
  });

  return buckets;
}

export function AnalyticsOverview({ results }: AnalyticsOverviewProps) {
  if (results.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">Process claims to view analytics.</p>
      </Card>
    );
  }

  const total = results.length;
  const stpCount = results.filter((r) => r.probability < 0.5).length;
  const moderateCount = results.filter((r) => r.probability >= 0.5 && r.probability < 0.75).length;
  const highRiskCount = total - stpCount - moderateCount;

  const averageScore = results.reduce((sum, r) => sum + r.totalScore, 0) / total;
  const averageProbability = results.reduce((sum, r) => sum + r.probability, 0) / total;

  const distributionData = buildDistribution(results);

  const metrics = [
    {
      label: 'STP',
      range: 'Score < 50%',
      count: stpCount,
      percentage: (stpCount / total) * 100,
    },
    {
      label: 'Moderate Non-STP',
      range: '50% - 75%',
      count: moderateCount,
      percentage: (moderateCount / total) * 100,
    },
    {
      label: 'High Risk STP',
      range: 'Score > 75%',
      count: highRiskCount,
      percentage: (highRiskCount / total) * 100,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Probability Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="bucket"
                  tickLine={false}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  wrapperStyle={{ outline: 'none' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                    color: 'hsl(var(--foreground))',
                    fontSize: '0.75rem',
                  }}
                  formatter={(value: number) => [`${value} claim${value === 1 ? '' : 's'}`, 'Count']}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Total evaluated claims
              </p>
              <p className="text-3xl font-semibold text-foreground">{total}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Average score
              </p>
              <p className="text-2xl font-semibold text-foreground">{averageScore.toFixed(3)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Average probability
              </p>
              <p className="text-2xl font-semibold text-foreground">
                {(averageProbability * 100).toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader>
              <CardTitle className="text-base font-semibold">{metric.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-2 pb-6">
              <p className="text-sm text-muted-foreground">{metric.range}</p>
              <p className="text-3xl font-semibold text-foreground">{metric.count}</p>
              <p className="text-xs text-muted-foreground">
                {metric.percentage.toFixed(1)}% of evaluated claims
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
