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
    <div className="glass-panel relative overflow-hidden px-8 py-10 text-center">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-40px] h-40 w-40 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-30px] h-48 w-48 rounded-full bg-accent/30 blur-[120px]" />
      </div>

      <div className="relative space-y-6">
        <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          Fraud Probability
        </h2>

        <div className="font-display text-[3.25rem] leading-tight text-foreground">
          {percentage}%
        </div>

        {showBreakdown && (
          <div className="space-y-3">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-2xl border border-white/40 bg-white/70 px-4 py-3 font-mono text-sm text-foreground shadow-inner shadow-black/5 transition-colors hover:bg-white/90"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <span className="truncate text-left">Sum: {breakdownText}</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {isExpanded && (
              <div className="space-y-2 text-left">
                {result.paths.map((path, index) => {
                  const isPositive = path.leafValue >= 0;
                  const valueColor = isPositive ? 'text-primary' : 'text-emerald-600';

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-2xl border border-white/40 bg-white/70 px-4 py-2 font-mono text-sm shadow-inner shadow-black/5"
                    >
                      <span className="text-muted-foreground">Tree #{path.treeIndex}</span>
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
          className="mx-auto inline-flex items-center justify-center rounded-full px-6 py-2 text-xs font-semibold uppercase tracking-[0.35em] shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${config.bgColor}, ${config.bgColor}cc)`,
            color: config.textColor
          }}
        >
          {config.label}
        </div>

        <div className="pt-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Claim <span className="ml-2 rounded-full bg-white/70 px-3 py-1 font-mono text-[0.75rem] text-foreground shadow-inner shadow-black/5">{result.claimNumber}</span>
        </div>
      </div>
    </div>
  );
}
