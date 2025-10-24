import { useMemo, useState } from 'react';
import type { TraceResult } from '@/lib/types/trace';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScoreCardProps {
  result: TraceResult;
  showBreakdown?: boolean;
}

export function ScoreCard({ result, showBreakdown = true }: ScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const riskConfig: Record<TraceResult['riskLevel'], {
    label: string;
    accent: string;
    ringColor: string;
    badgeClass: string;
    tone: string;
  }> = {
    low: {
      label: 'Low Risk',
      accent: 'from-emerald-200/80 via-emerald-100/70 to-white/70',
      ringColor: '#34d399',
      badgeClass: 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30',
      tone: 'text-emerald-600'
    },
    moderate: {
      label: 'Moderate Risk',
      accent: 'from-amber-200/80 via-amber-100/70 to-white/70',
      ringColor: '#f59e0b',
      badgeClass: 'bg-amber-500/15 text-amber-600 border border-amber-500/30',
      tone: 'text-amber-600'
    },
    high: {
      label: 'High Risk',
      accent: 'from-rose-200/80 via-rose-100/70 to-white/70',
      ringColor: '#f87171',
      badgeClass: 'bg-rose-500/15 text-rose-600 border border-rose-500/30',
      tone: 'text-rose-600'
    }
  };

  const config = riskConfig[result.riskLevel];
  const percentageValue = useMemo(() => Math.max(0, Math.min(100, result.probability * 100)), [result.probability]);
  const formattedPercentage = percentageValue.toFixed(1);

  const breakdownText = result.paths
    .map((path) => path.leafValue.toFixed(3))
    .join(' + ') + ` = ${result.totalScore.toFixed(3)}`;

  const ringStyle = {
    background: `conic-gradient(${config.ringColor} ${percentageValue}%, rgba(148, 163, 184, 0.18) ${percentageValue}% 100%)`
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-8 shadow-[0_35px_100px_-55px_rgba(14,116,144,0.45)] backdrop-blur-xl">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${config.accent} opacity-80`}
        aria-hidden
      />

      <div className="relative z-10 flex flex-col gap-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500/80 shadow-sm">
              Fraud Probability
            </div>
            <p className="text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
              {formattedPercentage}
              <span className="ml-1 text-2xl font-medium text-slate-400">%</span>
            </p>
            <p className="max-w-sm text-sm text-slate-600">
              Based on {result.paths.length} weighted signals converging on this claim evaluation.
            </p>
            <div className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${config.badgeClass} shadow-sm backdrop-blur-xl`}> 
              <span className="h-2 w-2 rounded-full bg-current" />
              <span>{config.label}</span>
            </div>
          </div>

          <div className="relative mx-auto flex h-44 w-44 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]" />
            <div className="absolute inset-0 rounded-full" style={ringStyle} />
            <div className="relative flex h-[72%] w-[72%] items-center justify-center rounded-full bg-white/90 text-center shadow-[0_20px_45px_-35px_rgba(15,23,42,0.35)]">
              <div className="space-y-1">
                <span className="block text-xs uppercase tracking-[0.28em] text-slate-400">Risk</span>
                <span className={`block text-lg font-semibold ${config.tone}`}>{config.label}</span>
              </div>
            </div>
          </div>
        </div>

        {showBreakdown && (
          <div className="space-y-4 rounded-2xl border border-white/60 bg-white/70 p-4 shadow-inner backdrop-blur-xl">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl border border-white/60 bg-white/80 px-4 py-3 font-mono text-sm text-slate-600 transition-colors hover:border-slate-200 hover:bg-white"
              onClick={() => setIsExpanded((prev) => !prev)}
            >
              <span className="truncate">Sum: {breakdownText}</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {isExpanded && (
              <div className="grid gap-2">
                {result.paths.map((path, index) => {
                  const isPositive = path.leafValue >= 0;

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl border border-white/60 bg-white/80 px-4 py-3 font-mono text-sm text-slate-600 shadow-sm"
                    >
                      <span className="text-slate-500">Tree #{path.treeIndex}</span>
                      <span className={cn('font-semibold', isPositive ? 'text-rose-500' : 'text-emerald-500')}>
                        {isPositive ? '+' : ''}{path.leafValue.toFixed(3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/70 pt-4 text-xs text-slate-500">
          <span>
            Claim <span className="font-mono text-slate-600">{result.claimNumber}</span>
          </span>
          <span className="font-medium text-slate-600">Total Score: {result.totalScore.toFixed(3)}</span>
        </div>
      </div>
    </div>
  );
}
