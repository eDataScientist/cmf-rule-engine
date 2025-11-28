import { useState } from 'react';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import type { TraceResult, TreePath } from '@/lib/types/trace';

interface ResultsHUDProps {
  result: TraceResult | null;
  isEvaluating: boolean;
}

const riskConfig = {
  low: { bg: '#22c55e', text: 'Low Risk' },
  moderate: { bg: '#f97316', text: 'Moderate' },
  high: { bg: '#ef4444', text: 'High Risk' },
};

export function ResultsHUD({ result, isEvaluating }: ResultsHUDProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Empty state
  if (!result && !isEvaluating) {
    return (
      <div
        className="px-6 py-4 border-b flex items-center"
        style={{ borderColor: '#27272a', backgroundColor: '#18181b' }}
      >
        <span className="text-sm" style={{ color: '#71717a' }}>
          Select a tree and enter claim data to see results
        </span>
      </div>
    );
  }

  const config = result ? riskConfig[result.riskLevel] : null;
  const percentage = result ? (result.probability * 100).toFixed(1) : '0.0';

  return (
    <div
      className="border-b"
      style={{ borderColor: '#27272a', backgroundColor: '#18181b' }}
    >
      {/* Summary Row - Always visible */}
      <div
        className="px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-zinc-800/50 transition-colors"
        onClick={() => result && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-6">
          {/* Fraud Probability */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#71717a' }}>
              Probability
            </span>
            <span className="text-xl font-bold" style={{ color: '#fafafa' }}>
              {isEvaluating ? '...' : `${percentage}%`}
            </span>
          </div>

          {/* Total Score */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#71717a' }}>
              Score
            </span>
            <span className="font-mono text-lg" style={{ color: '#fafafa' }}>
              {isEvaluating ? '...' : result?.totalScore.toFixed(3)}
            </span>
          </div>

          {/* Risk Badge */}
          {config && !isEvaluating && (
            <span
              className="px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider"
              style={{ backgroundColor: config.bg, color: '#ffffff' }}
            >
              {config.text}
            </span>
          )}
        </div>

        {/* Right side: Loading or expand toggle */}
        <div className="flex items-center gap-2">
          {isEvaluating && (
            <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#71717a' }} />
          )}
          {result && !isEvaluating && (
            <button
              className="p-1 rounded hover:bg-zinc-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" style={{ color: '#71717a' }} />
              ) : (
                <ChevronDown className="h-4 w-4" style={{ color: '#71717a' }} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Breakdown */}
      {isExpanded && result && (
        <div className="px-6 pb-4 border-t" style={{ borderColor: '#27272a' }}>
          <div className="pt-3 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#71717a' }}>
                Per-Tree Breakdown
              </span>
              <span className="text-xs font-mono" style={{ color: '#a1a1aa' }}>
                {result.paths.length} trees
              </span>
            </div>
            <div className="grid gap-1.5">
              {result.paths.map((path: TreePath) => {
                const isPositive = path.leafValue >= 0;
                return (
                  <div
                    key={path.treeIndex}
                    className="flex items-center justify-between px-3 py-2 rounded"
                    style={{ backgroundColor: '#27272a' }}
                  >
                    <span className="text-sm font-medium" style={{ color: '#a1a1aa' }}>
                      Tree #{path.treeIndex}
                    </span>
                    <span
                      className="text-sm font-mono font-semibold"
                      style={{ color: isPositive ? '#ef4444' : '#22c55e' }}
                    >
                      {isPositive ? '+' : ''}{path.leafValue.toFixed(4)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
