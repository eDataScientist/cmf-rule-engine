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
      accent: 'from-emerald-400/90 to-teal-400/70',
      text: 'text-emerald-700',
    },
    moderate: {
      label: 'Moderate Risk',
      accent: 'from-amber-400/90 to-orange-400/70',
      text: 'text-amber-700',
    },
    high: {
      label: 'High Risk',
      accent: 'from-rose-500/90 to-red-400/80',
      text: 'text-rose-700',
    },
  } as const;

  const config = riskConfig[result.riskLevel];
  const percentage = (result.probability * 100).toFixed(1);

  const breakdownText =
    result.paths.map((p) => p.leafValue.toFixed(3)).join(' + ') + ` = ${result.totalScore.toFixed(3)}`;

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-gradient-to-br from-white via-sky-50 to-sky-100/60 p-8 text-slate-900 shadow-[0_45px_85px_-60px_rgba(15,23,42,0.9)] backdrop-blur">
      <div className="pointer-events-none absolute -right-24 top-[-90px] h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-[-120px] h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />

      <div className="relative space-y-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Fraud probability
            </p>
            <h2 className="text-5xl font-semibold tracking-tight">{percentage}%</h2>
            <p className="text-sm text-muted-foreground">
              Based on the combined contribution of {result.paths.length} trees for claim{' '}
              <span className="font-mono text-foreground">{result.claimNumber}</span>.
            </p>
          </div>

          <div className="relative flex h-28 w-28 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/90 to-white/50 shadow-inner shadow-slate-200/80" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/70 bg-white/70 text-center shadow-lg shadow-slate-200/60">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Score
                <span className="block pt-1 text-2xl font-semibold text-slate-900">
                  {result.totalScore.toFixed(2)}
                </span>
              </span>
            </div>
          </div>
        </div>

        {showBreakdown && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-5 py-3 text-left font-mono text-sm text-muted-foreground shadow-inner shadow-slate-200/50 transition-all duration-300 hover:bg-white/90 hover:text-foreground"
            >
              <span>Sum: {breakdownText}</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {isExpanded && (
              <div className="grid gap-3 text-sm">
                {result.paths.map((path, index) => {
                  const isPositive = path.leafValue >= 0;
                  const valueColor = isPositive ? 'text-rose-500' : 'text-emerald-500';

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/75 px-4 py-3 font-mono shadow-inner shadow-slate-200/50"
                    >
                      <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        Tree #{path.treeIndex}
                      </span>
                      <span className={`text-base font-semibold ${valueColor}`}>
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

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/75 p-4 shadow-inner shadow-slate-200/50">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full bg-gradient-to-r ${config.accent} px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow shadow-sky-200/70`}
            >
              {config.label}
            </span>
            <span className={`text-sm font-medium ${config.text}`}>
              Probability {percentage}%
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Last evaluated on{' '}
            <span className="font-medium text-foreground">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
