import { useState } from 'react';
import type { TraceResult } from '@/lib/types/trace';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScoreCardProps {
  result: TraceResult;
  showBreakdown?: boolean;
}

const riskConfig: Record<TraceResult['riskLevel'], { label: string; accent: string; chip: string }> = {
  low: {
    label: 'Low Risk',
    accent: 'from-emerald-400/90 to-emerald-500',
    chip: 'bg-emerald-100 text-emerald-700'
  },
  moderate: {
    label: 'Moderate Risk',
    accent: 'from-amber-300/90 to-amber-400',
    chip: 'bg-amber-100 text-amber-700'
  },
  high: {
    label: 'High Risk',
    accent: 'from-rose-400/90 to-rose-500',
    chip: 'bg-rose-100 text-rose-700'
  }
};

export function ScoreCard({ result, showBreakdown = true }: ScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = riskConfig[result.riskLevel];
  const percentage = (result.probability * 100).toFixed(1);

  const breakdownText = result.paths
    .map((p) => p.leafValue.toFixed(3))
    .join(' + ') + ` = ${result.totalScore.toFixed(3)}`;

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/80 p-10 text-center shadow-[0_30px_60px_rgba(70,82,186,0.12)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute -top-12 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-12 h-32 w-32 rounded-full bg-[#f8d8b5]/50 blur-3xl" />

      <div className="relative">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Fraud Probability</p>
        <div className="mt-6 flex items-center justify-center">
          <div className="relative">
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.accent} blur-xl opacity-40`} />
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border border-white/70 bg-white/70 shadow-[0_20px_45px_rgba(70,82,186,0.12)]">
              <span className="text-5xl font-semibold tracking-tight text-[#27335b]">
                {percentage}%
              </span>
            </div>
          </div>
        </div>

        {showBreakdown && (
          <div className="mt-8">
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm font-medium text-[#27335b] shadow-inner shadow-white/50 transition hover:border-primary/40"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-muted-foreground">
                  Sum: {breakdownText}
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="mt-4 space-y-3 text-left">
                {result.paths.map((path, index) => {
                  const isPositive = path.leafValue >= 0;
                  const valueColor = isPositive ? 'text-rose-500' : 'text-emerald-500';

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/80 px-4 py-3 font-mono text-xs shadow-sm"
                    >
                      <span className="text-muted-foreground">Tree #{path.treeIndex}</span>
                      <span className={cn('font-semibold', valueColor)}>
                        {isPositive ? '+' : ''}{path.leafValue.toFixed(3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="mt-10 flex flex-col items-center gap-4">
          <span className={`inline-flex items-center rounded-full px-4 py-1 text-sm font-semibold shadow-sm ${config.chip}`}>
            {config.label}
          </span>
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Claim <span className="ml-2 rounded-full bg-white/80 px-3 py-1 font-mono text-[0.65rem] text-[#27335b] shadow-inner shadow-white/40">{result.claimNumber}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
