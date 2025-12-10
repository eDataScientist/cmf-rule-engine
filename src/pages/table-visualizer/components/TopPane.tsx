import { ViewModeToggle } from './ViewModeToggle';
import { AnalyticsOverview } from './AnalyticsOverview';
import { ClaimsTable } from './ClaimsTable';
import type { TraceResult } from '@/lib/types/trace';
import type { ClaimWithResult } from '@/store/atoms/tableVisualization';

interface TopPaneProps {
  viewMode: 'analytics' | 'table';
  onViewModeChange: (mode: 'analytics' | 'table') => void;

  // Analytics view
  results: TraceResult[];

  // Table view
  claimsWithResults: ClaimWithResult[];
  requiredColumns: string[];
  selectedClaimIndex: number | null;
  onClaimSelect: (claim: ClaimWithResult) => void;
  isProcessing: boolean;
  totalUnfilteredCount?: number;
  claimNumberColumn?: string | null;
}

export function TopPane({
  viewMode,
  onViewModeChange,
  results,
  claimsWithResults,
  requiredColumns,
  selectedClaimIndex,
  onClaimSelect,
  isProcessing,
  totalUnfilteredCount,
  claimNumberColumn,
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
          <AnalyticsOverview results={results} />
        ) : (
          <ClaimsTable
            claims={claimsWithResults}
            requiredColumns={requiredColumns}
            selectedClaimIndex={selectedClaimIndex}
            onClaimSelect={onClaimSelect}
            isProcessing={isProcessing}
            totalUnfilteredCount={totalUnfilteredCount}
            claimNumberColumn={claimNumberColumn}
          />
        )}
      </div>
    </div>
  );
}
