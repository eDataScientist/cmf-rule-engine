import { useState } from 'react';
import type { TraceResult } from '@/lib/types/trace';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ScoreCardProps {
  result: TraceResult;
  showBreakdown?: boolean;
}

export function ScoreCard({ result, showBreakdown = true }: ScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const riskConfig = {
    low: {
      label: 'Low Risk',
      bgColor: '#22c55e',
      textColor: '#fafafa'
    },
    moderate: {
      label: 'Moderate Risk',
      bgColor: '#f59e0b',
      textColor: '#fafafa'
    },
    high: {
      label: 'High Risk',
      bgColor: '#ef4444',
      textColor: '#fafafa'
    }
  };

  const config = riskConfig[result.riskLevel];
  const percentage = (result.probability * 100).toFixed(1);

  const breakdownText = result.paths
    .map(p => p.leafValue.toFixed(3))
    .join(' + ') + ` = ${result.totalScore.toFixed(3)}`;

  return (
    <div className="bg-[#18181b] text-white rounded-xl p-8 text-center">
      <h2 className="text-sm font-medium uppercase tracking-wider opacity-70 mb-2">
        Fraud Probability
      </h2>

      <div className="text-[3.5rem] font-bold leading-tight tracking-tight mb-4">
        {percentage}%
      </div>

      {showBreakdown && (
        <div className="mb-5">
          <div
            className="font-mono text-sm bg-white/10 px-3 py-2 rounded-md cursor-pointer hover:bg-white/15 transition-colors"
            style={{ opacity: 0.8 }}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center justify-between">
              <span>Sum: {breakdownText}</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </div>

          {isExpanded && (
            <div className="mt-3 space-y-2 text-left">
              {result.paths.map((path, index) => {
                const isPositive = path.leafValue >= 0;
                const valueColor = isPositive ? 'text-red-400' : 'text-green-400';

                return (
                  <div
                    key={index}
                    className="bg-white/5 px-3 py-2 rounded-md flex items-center justify-between font-mono text-sm"
                  >
                    <span className="opacity-70">Tree #{path.treeIndex}</span>
                    <span className={`font-semibold ${valueColor}`}>
                      {isPositive ? '+' : ''}{path.leafValue.toFixed(3)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div
        className="inline-block font-semibold px-4 py-2 rounded-full text-sm transition-all"
        style={{
          backgroundColor: config.bgColor,
          color: config.textColor
        }}
      >
        {config.label}
      </div>

      <div className="mt-6 pt-4 border-t border-white/20">
        <div className="text-xs opacity-60">
          Claim: <span className="font-mono">{result.claimNumber}</span>
        </div>
      </div>
    </div>
  );
}
