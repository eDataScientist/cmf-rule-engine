import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import type { FinancialMetrics } from '@/lib/types/trace';

interface PriceDistributionHistogramProps {
  priceDistribution: FinancialMetrics['priceDistribution'];
}

export function PriceDistributionHistogram({ priceDistribution }: PriceDistributionHistogramProps) {
  // Merge high and low bins into single dataset for overlaid area charts

  const data = priceDistribution.high.map((highBin, idx) => ({
    binLabel: highBin.binLabel,
    highRiskCount: highBin.count,
    lowRiskCount: priceDistribution.low[idx]?.count || 0,
  }));

  // If no data, show empty state
  if (data.length === 0 || data.every(d => d.highRiskCount === 0 && d.lowRiskCount === 0)) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-sm text-zinc-500">No price data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ left: 10, right: 20, top: 10, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis
          dataKey="binLabel"
          tickLine={false}
          axisLine={false}
          stroke="#a1a1aa"
          fontSize={10}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          stroke="#a1a1aa"
          fontSize={11}
          label={{
            value: 'Count of Claims',
            angle: -90,
            position: 'insideLeft',
            style: { fill: '#a1a1aa', fontSize: 11 },
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '6px',
            fontSize: '12px',
          }}
          labelStyle={{ color: '#fafafa', marginBottom: '4px' }}
          itemStyle={{ color: '#a1a1aa' }}
        />
        <Legend
          wrapperStyle={{
            fontSize: '12px',
            color: '#a1a1aa',
          }}
        />
        {/* Overlaid continuous histograms with transparency */}
        <Area
          type="monotone"
          dataKey="lowRiskCount"
          stroke="#22c55e"
          fill="#22c55e"
          fillOpacity={0.4}
          strokeWidth={2}
          name="Low Risk (STP)"
        />
        <Area
          type="monotone"
          dataKey="highRiskCount"
          stroke="#ef4444"
          fill="#ef4444"
          fillOpacity={0.4}
          strokeWidth={2}
          name="High Risk"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
