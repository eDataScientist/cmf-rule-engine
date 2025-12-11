import { Table2, ChevronDown, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TracedTreeVisualizer } from '@/pages/visualize-trace/components/TracedTreeVisualizer';
import { ResultsHUD } from '@/pages/visualize-trace/components/ResultsHUD';
import { SeverityBadge } from './SeverityBadge';
import type { TreeNode } from '@/lib/types/tree';
import type { ClaimWithResult, AnalysisMode } from '@/store/atoms/tableVisualization';

interface TraceInspectorProps {
  selectedClaim: ClaimWithResult | null;
  treeStructure: { title: string; root: TreeNode }[] | null;
  onCollapse: () => void;
  isCollapsed: boolean;
  analysisMode: AnalysisMode;
}

export function TraceInspector({ selectedClaim, treeStructure, onCollapse, isCollapsed, analysisMode }: TraceInspectorProps) {
  // Empty state: No model/rules loaded
  if (analysisMode === 'trees' && !treeStructure) {
    return (
      <div
        className="h-full flex items-center justify-center"
        style={{ backgroundColor: '#09090b' }}
      >
        <p className="text-sm text-zinc-500">Select a tree model to enable trace inspection</p>
      </div>
    );
  }

  // Empty state: No claim selected or no result
  const hasResult = analysisMode === 'trees' ? selectedClaim?.result : selectedClaim?.ruleResult;
  if (!hasResult) {
    return (
      <div
        className="h-full flex items-center justify-center"
        style={{
          backgroundColor: '#09090b',
          backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        <div className="text-center">
          <Table2 className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-sm text-zinc-500">
            {analysisMode === 'trees'
              ? 'Select a claim from the table above to view its decision trace'
              : 'Select a claim from the table above to view matched rules'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {!isCollapsed && selectedClaim && (
        <div className="flex items-center justify-between border-b px-4 py-2" style={{ borderBottomWidth: '1px', borderColor: '#27272a', backgroundColor: '#18181b' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {analysisMode === 'trees' ? 'Trace Inspector' : 'Rule Matches'}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCollapse}
            className="h-7 px-2 gap-1 text-zinc-400 hover:text-zinc-100"
          >
            <ChevronDown className="h-4 w-4" />
            <span className="text-xs">Collapse</span>
          </Button>
        </div>
      )}

      {/* Content based on mode */}
      {!isCollapsed && analysisMode === 'trees' && selectedClaim?.result && (
        <>
          <ResultsHUD result={selectedClaim.result} isEvaluating={false} />
          <div className="flex-1 overflow-auto" style={{ paddingBottom: '80px' }}>
            <TracedTreeVisualizer trees={treeStructure!} paths={selectedClaim.result.paths} />
          </div>
        </>
      )}

      {/* Rules mode: Show matched rules with conditions */}
      {!isCollapsed && analysisMode === 'rules' && selectedClaim?.ruleResult && (
        <div className="flex-1 overflow-auto p-4">
          {/* Summary */}
          <div className="mb-4 p-3 rounded border" style={{ borderColor: '#27272a', backgroundColor: '#18181b' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">Total Matches</p>
                <p className="text-2xl font-bold text-zinc-100">{selectedClaim.ruleResult.totalMatches}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Max Severity</p>
                <SeverityBadge severity={selectedClaim.ruleResult.maxSeverity} size="md" />
              </div>
            </div>
          </div>

          {/* Matched Rules List */}
          {selectedClaim.ruleResult.matchedRules.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Matched Rules ({selectedClaim.ruleResult.matchedRules.length})
              </p>
              {selectedClaim.ruleResult.matchedRules.map((match, idx) => (
                <div
                  key={match.ruleId || idx}
                  className="rounded border p-3"
                  style={{ borderColor: '#27272a', backgroundColor: '#18181b' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-zinc-400">Rule #{idx + 1}</span>
                    <SeverityBadge severity={match.severity} size="xs" />
                  </div>
                  <div className="space-y-1">
                    {match.conditions.map((cond, condIdx) => (
                      <div key={condIdx} className="flex items-center gap-2 text-xs">
                        {cond.passed ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                        )}
                        <span className="font-mono text-zinc-300">{cond.field}</span>
                        <span className="text-zinc-500">{cond.operator}</span>
                        <span className="text-zinc-400">{String(cond.expectedValue)}</span>
                        <span className="text-zinc-600 ml-auto">
                          actual: <span className="text-zinc-400">{String(cond.actualValue ?? 'null')}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 text-center py-8">
              No rules matched this claim
            </p>
          )}
        </div>
      )}

      {/* Collapsed State */}
      {isCollapsed && selectedClaim && (
        <div className="flex items-center justify-center h-full" style={{ backgroundColor: '#09090b' }}>
          <div className="text-center">
            <ChevronDown className="h-8 w-8 text-zinc-700 mx-auto mb-2 animate-bounce" />
            <p className="text-xs text-zinc-500">
              {analysisMode === 'trees' ? 'Drag up to view trace' : 'Drag up to view rule matches'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
