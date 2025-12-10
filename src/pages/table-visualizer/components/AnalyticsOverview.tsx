import type { TraceResult, FinancialMetrics } from '@/lib/types/trace';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { formatCurrency } from '../utils/formatCurrency';
import { ValueByRiskChart } from './ValueByRiskChart';
import { PriceDistributionHistogram } from './PriceDistributionHistogram';
import { Loader2 } from 'lucide-react';

interface AnalyticsOverviewProps {
  results: TraceResult[];
  financialMetrics: FinancialMetrics | null;
  isLoadingMetrics?: boolean;
}

const BUCKET_COUNT = 10;

// Pie chart colors
const RISK_COLORS = {
  low: '#22c55e',      // Green
  moderate: '#f59e0b', // Orange
  high: '#ef4444',     // Red
};

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

export function AnalyticsOverview({ results, financialMetrics, isLoadingMetrics }: AnalyticsOverviewProps) {
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

  // Pie chart data
  const pieData = [
    { name: 'STP', value: stpCount, color: RISK_COLORS.low },
    { name: 'Moderate', value: moderateCount, color: RISK_COLORS.moderate },
    { name: 'High Risk', value: highRiskCount, color: RISK_COLORS.high },
  ];

  const hasFinancialData = financialMetrics && financialMetrics.claimsWithFinancialData > 0;

  return (
    <div className="p-6 space-y-6">
      {/* Row 1: Probability Distribution + Risk Pie Chart */}
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

        {/* Risk Level Pie Chart */}
        <div className="border rounded-md p-4" style={{ borderColor: '#27272a', backgroundColor: '#18181b' }}>
          <h4 className="text-sm font-semibold text-zinc-100 mb-4">Risk Classification</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                  }}
                  labelStyle={{ color: '#fafafa', marginBottom: '4px' }}
                  itemStyle={{ color: '#fafafa' }}
                  formatter={(value: number) => [`${value} claims`, 'Count']}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: '12px',
                    color: '#a1a1aa',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Horizontal Metric Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {/* Total Evaluated Claims */}
        <div className="border rounded-md p-3" style={{ borderColor: '#27272a', backgroundColor: '#18181b' }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            Total Claims
          </p>
          <p className="text-2xl font-semibold text-zinc-100 font-mono">{total}</p>
        </div>

        {/* Average Score */}
        <div className="border rounded-md p-3" style={{ borderColor: '#27272a', backgroundColor: '#18181b' }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            Avg Score
          </p>
          <p className="text-2xl font-semibold text-zinc-100 font-mono">{averageScore.toFixed(3)}</p>
        </div>

        {/* Average Probability */}
        <div className="border rounded-md p-3" style={{ borderColor: '#27272a', backgroundColor: '#18181b' }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            Avg Probability
          </p>
          <p className="text-2xl font-semibold text-zinc-100 font-mono">
            {(averageProbability * 100).toFixed(1)}%
          </p>
        </div>

        {/* Total Claimed Value */}
        {isLoadingMetrics && (
          <div className="border rounded-md p-3 flex items-center justify-center col-span-2" style={{ borderColor: '#27272a', backgroundColor: '#18181b' }}>
            <Loader2 className="h-5 w-5 animate-spin text-zinc-500 mr-2" />
            <p className="text-xs text-zinc-500">Loading financial metrics...</p>
          </div>
        )}
        {hasFinancialData && !isLoadingMetrics && (
          <>
            <div className="border rounded-md p-3" style={{ borderColor: '#27272a', backgroundColor: '#18181b' }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                Total Value
              </p>
              <p className="text-2xl font-semibold text-zinc-100 font-mono">
                {formatCurrency(financialMetrics.totalClaimedValue)}
              </p>
            </div>

            <div className="border rounded-md p-3" style={{ borderColor: '#27272a', backgroundColor: '#18181b' }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                Avg Value
              </p>
              <p className="text-2xl font-semibold text-zinc-100 font-mono">
                {formatCurrency(financialMetrics.averageClaimValue)}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Row 3: Financial Analytics Charts */}
      {hasFinancialData && !isLoadingMetrics && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Value by Risk Level */}
          <div className="border rounded-md p-4" style={{ borderColor: '#27272a', backgroundColor: '#18181b' }}>
            <h4 className="text-sm font-semibold text-zinc-100 mb-4">Value by Risk Level</h4>
            <ValueByRiskChart valueByRisk={financialMetrics.valueByRisk} />
          </div>

          {/* Price Distribution: High Risk vs STP */}
          <div className="border rounded-md p-4" style={{ borderColor: '#27272a', backgroundColor: '#18181b' }}>
            <h4 className="text-sm font-semibold text-zinc-100 mb-4">
              Price Distribution: High Risk vs STP
            </h4>
            <PriceDistributionHistogram priceDistribution={financialMetrics.priceDistribution} />
          </div>
        </div>
      )}
    </div>
  );
}
