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
      accent: 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/20',
      dot: 'bg-emerald-500',
    },
    moderate: {
      label: 'Moderate Risk',
      accent: 'bg-amber-400/15 text-amber-700 border border-amber-400/20',
      dot: 'bg-amber-400',
    },
    high: {
      label: 'High Risk',
      accent: 'bg-rose-500/15 text-rose-700 border border-rose-500/25',
      dot: 'bg-rose-500',
    },
  } as const;

  const config = riskConfig[result.riskLevel];
  const percentage = (result.probability * 100).toFixed(1);

  const breakdownText = result.paths
    .map((p) => p.leafValue.toFixed(3))
    .join(' + ') + ` = ${result.totalScore.toFixed(3)}`;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-white via-white to-primary/10 p-10 text-center shadow-xl shadow-black/5">
      <div className="pointer-events-none absolute inset-x-16 top-0 h-32 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
      <div className="relative space-y-6">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.5em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
          Fraud Probability
          <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
        </div>

        <div className="text-[3.25rem] font-semibold leading-tight text-foreground">
          {percentage}%
        </div>

        {showBreakdown && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-left font-mono text-sm text-muted-foreground shadow-inner shadow-black/5 transition-all duration-300 hover:border-primary/30 hover:text-primary"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="truncate">Sum: {breakdownText}</span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="grid gap-2 rounded-2xl border border-white/60 bg-white/70 p-4 text-left shadow-inner shadow-black/5">
                {result.paths.map((path, index) => {
                  const isPositive = path.leafValue >= 0;
                  const valueColor = isPositive ? 'text-rose-500' : 'text-emerald-600';

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl border border-white/50 bg-white/80 px-4 py-3 font-mono text-sm text-muted-foreground shadow-sm"
                    >
                      <span className="flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-primary/40" />
                        Tree #{path.treeIndex}
                      </span>
                      <span className={`font-semibold ${valueColor}`}>
                        {isPositive ? '+' : ''}
                        {path.leafValue.toFixed(3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div
          className={`mx-auto flex w-fit items-center gap-3 rounded-full px-5 py-2 text-sm font-semibold ${config.accent}`}
        >
          <span className={`h-2.5 w-2.5 rounded-full ${config.dot}`} />
          {config.label}
        </div>

        <div className="pt-4 text-xs uppercase tracking-[0.45em] text-muted-foreground">
          Claim <span className="font-mono text-foreground tracking-normal">{result.claimNumber}</span>
        </div>
      </div>
    </div>
  );
}
