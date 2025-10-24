import { useState } from 'react';
import type { TraceResult } from '@/lib/types/trace';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ScoreCardProps {
  result: TraceResult;
  showBreakdown?: boolean;
}

const riskConfig = {
  low: {
    label: 'Low Risk',
    badgeClass:
      'bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500 text-emerald-950 shadow-[0_10px_30px_-18px_rgba(16,185,129,0.7)]',
  },
  moderate: {
    label: 'Moderate Risk',
    badgeClass:
      'bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400 text-amber-900 shadow-[0_10px_30px_-18px_rgba(245,158,11,0.65)]',
  },
  high: {
    label: 'High Risk',
    badgeClass:
      'bg-gradient-to-r from-rose-300 via-rose-400 to-rose-500 text-rose-950 shadow-[0_10px_30px_-18px_rgba(244,63,94,0.6)]',
  },
} satisfies Record<TraceResult['riskLevel'], { label: string; badgeClass: string }>;

export function ScoreCard({ result, showBreakdown = true }: ScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const config = riskConfig[result.riskLevel];
  const percentage = (result.probability * 100).toFixed(1);

  const breakdownText =
    result.paths
      .map((path) => path.leafValue.toFixed(3))
      .join(' + ') + ` = ${result.totalScore.toFixed(3)}`;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-white/80 p-8 text-center shadow-[0_38px_90px_-60px_rgba(15,23,42,0.55)] backdrop-blur-lg">
      <div className="pointer-events-none absolute inset-x-6 top-[-40%] -z-10 h-72 rounded-[50%] bg-[radial-gradient(circle,_rgba(142,160,227,0.28),_transparent_65%)]" />

      <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.55em] text-muted-foreground">
        Fraud Probability
      </h2>

      <div className="mt-6 font-heading text-[3.25rem] font-semibold leading-none tracking-tight sm:text-[3.75rem]">
        {percentage}%
      </div>

      {showBreakdown && (
        <div className="mt-8 text-left">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Score breakdown</p>

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="mt-3 flex w-full items-center justify-between rounded-2xl border border-border/70 bg-white/80 px-4 py-3 font-mono text-sm text-muted-foreground shadow-sm transition-all duration-300 hover:border-primary/40 hover:bg-white"
          >
            <span className="truncate">Sum: {breakdownText}</span>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {isExpanded && (
            <div className="mt-4 space-y-2">
              {result.paths.map((path, index) => {
                const isPositive = path.leafValue >= 0;
                const valueColor = isPositive ? 'text-rose-500' : 'text-emerald-500';

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-2xl border border-border/60 bg-gradient-to-r from-primary/5 via-transparent to-transparent px-4 py-3 font-mono text-xs text-muted-foreground shadow-sm sm:text-sm"
                  >
                    <span className="opacity-70">Tree #{path.treeIndex}</span>
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
        className={`mt-8 inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-semibold uppercase tracking-[0.3em] ${config.badgeClass}`}
      >
        {config.label}
      </div>

      <div className="mt-8 border-t border-border/70 pt-4 text-xs uppercase tracking-[0.35em] text-muted-foreground">
        Claim <span className="ml-2 font-mono normal-case tracking-normal text-foreground">{result.claimNumber}</span>
      </div>
    </div>
  );
}
