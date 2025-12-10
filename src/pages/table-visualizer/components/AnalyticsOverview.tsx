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
      <div className="h-full flex items-center justify-center p-8">
        <p className="text-sm text-zinc-500">Process claims to view analytics.</p>
      </div>
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
    <div className="p-6 space-y-6">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        {/* Probability Distribution Chart */}
        <div className="border rounded-md p-4" style={{ borderColor: '#27272a', backgroundColor: '#18181b' }}>
          <h4 className="text-sm font-semibold text-zinc-100 mb-4">Probability Distribution</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="bucket"
                  tickLine={false}
                  axisLine={false}
                  stroke="#a1a1aa"
                  fontSize={12}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  stroke="#a1a1aa"
                  fontSize={12}
                />
                <Tooltip
                  cursor={{ fill: '#27272a' }}
                  wrapperStyle={{ outline: 'none' }}
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '6px',
                    color: '#fafafa',
                    fontSize: '0.75rem',
                  }}
                  formatter={(value: number) => [`${value} claim${value === 1 ? '' : 's'}`, 'Count']}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Panel */}
        <div className="border rounded-md p-4" style={{ borderColor: '#27272a', backgroundColor: '#18181b' }}>
          <h4 className="text-sm font-semibold text-zinc-100 mb-4">Summary</h4>
          <div className="space-y-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Total evaluated claims
              </p>
              <p className="text-3xl font-semibold text-zinc-100 font-mono">{total}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Average score
              </p>
              <p className="text-2xl font-semibold text-zinc-100 font-mono">{averageScore.toFixed(3)}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Average probability
              </p>
              <p className="text-2xl font-semibold text-zinc-100 font-mono">
                {(averageProbability * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="border rounded-md p-4"
            style={{ borderColor: '#27272a', backgroundColor: '#18181b' }}
          >
            <h5 className="text-sm font-semibold text-zinc-100 mb-2">{metric.label}</h5>
            <div className="space-y-2">
              <p className="text-xs text-zinc-400">{metric.range}</p>
              <p className="text-3xl font-semibold text-zinc-100 font-mono">{metric.count}</p>
              <p className="text-xs text-zinc-500">
                {metric.percentage.toFixed(1)}% of evaluated claims
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
