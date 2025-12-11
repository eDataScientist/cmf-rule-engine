import { ViewModeToggle } from './ViewModeToggle';
import { AnalyticsOverview } from './AnalyticsOverview';
import { ClaimsTable } from './ClaimsTable';
import type { TraceResult, FinancialMetrics } from '@/lib/types/trace';
import type { ClaimWithResult, AnalysisMode } from '@/store/atoms/tableVisualization';

interface TopPaneProps {
  viewMode: 'analytics' | 'table';
  onViewModeChange: (mode: 'analytics' | 'table') => void;

  // Analytics view
  results: TraceResult[];
  financialMetrics: FinancialMetrics | null;
  isLoadingMetrics?: boolean;

  // Table view
  claimsWithResults: ClaimWithResult[];
  requiredColumns: string[];
  ruleColumns?: string[]; // Columns used in rules (for rules mode)
  selectedClaimIndex: number | null;
  onClaimSelect: (claim: ClaimWithResult) => void;
  isProcessing: boolean;
  totalUnfilteredCount?: number;
  claimNumberColumn?: string | null;

  // Analysis mode
  analysisMode: AnalysisMode;
}

export function TopPane({
  viewMode,
  onViewModeChange,
  results,
  financialMetrics,
  isLoadingMetrics,
  claimsWithResults,
  requiredColumns,
  ruleColumns,
  selectedClaimIndex,
  onClaimSelect,
  isProcessing,
  totalUnfilteredCount,
  claimNumberColumn,
  analysisMode,
}: TopPaneProps) {
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#09090b' }}>
      {/* Header with toggle */}
      <div
        className="border-b px-6 py-3 flex items-center justify-between"
        style={{ borderBottomWidth: '1px', borderColor: '#27272a', backgroundColor: '#18181b' }}
      >
        <h3 className="text-sm font-semibold text-zinc-100">
          {viewMode === 'analytics' ? 'Analytics Overview' : 'Claims Data'}
        </h3>

        <ViewModeToggle mode={viewMode} onChange={onViewModeChange} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'analytics' ? (
          <AnalyticsOverview
            results={results}
            financialMetrics={financialMetrics}
            isLoadingMetrics={isLoadingMetrics}
          />
        ) : (
          <ClaimsTable
            claims={claimsWithResults}
            requiredColumns={requiredColumns}
            ruleColumns={ruleColumns}
            selectedClaimIndex={selectedClaimIndex}
            onClaimSelect={onClaimSelect}
            isProcessing={isProcessing}
            totalUnfilteredCount={totalUnfilteredCount}
            claimNumberColumn={claimNumberColumn}
            analysisMode={analysisMode}
          />
        )}
      </div>
    </div>
  );
}
