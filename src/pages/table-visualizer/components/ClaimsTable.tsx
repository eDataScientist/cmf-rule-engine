import { useEffect, useMemo, useState } from 'react';
import { RiskBadge } from '@/components/shared/ScoreCard/RiskBadge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ClaimWithResult } from '@/store/atoms/tableVisualization';

type RiskLevel = 'low' | 'moderate' | 'high';

interface ClaimsTableProps {
  claims: ClaimWithResult[];
  requiredColumns?: string[];
  selectedClaimIndex: number | null;
  onClaimSelect: (claim: ClaimWithResult) => void;
  isProcessing?: boolean;
  totalUnfilteredCount?: number;
  claimNumberColumn?: string | null;
}

const ROWS_PER_PAGE = 10;
const RISK_FILTERS: { label: string; value: RiskLevel | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'STP', value: 'low' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'High Risk', value: 'high' },
];

export function ClaimsTable({
  claims,
  requiredColumns,
  selectedClaimIndex,
  onClaimSelect,
  isProcessing,
  totalUnfilteredCount,
  claimNumberColumn,
}: ClaimsTableProps) {
  if (claims.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <p className="text-sm text-zinc-500">No claims data loaded</p>
      </div>
    );
  }

  // Use required columns if provided, otherwise show all columns except the claim number column
  const displayColumns = requiredColumns
    ? requiredColumns.filter((col) => col !== claimNumberColumn).sort()
    : Array.from(new Set(claims.flatMap((c) => Object.keys(c.claim)))).filter(
        (key) => key !== claimNumberColumn
      );

  const [page, setPage] = useState(1);
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<RiskLevel | 'all'>('all');

  // Filter claims based on selected risk level
  const filteredClaims = useMemo(() => {
    if (selectedRiskFilter === 'all') {
      return claims;
    }
    return claims.filter((item) => item.result?.riskLevel === selectedRiskFilter);
  }, [claims, selectedRiskFilter]);

  useEffect(() => {
    setPage(1);
  }, [claims.length, selectedRiskFilter]);

  useEffect(() => {
    setPage((prev) => {
      const totalPages = Math.max(1, Math.ceil(filteredClaims.length / ROWS_PER_PAGE));
      return Math.min(prev, totalPages);
    });
  }, [filteredClaims.length]);

  const totalPages = Math.max(1, Math.ceil(filteredClaims.length / ROWS_PER_PAGE));
  const startIndex = (page - 1) * ROWS_PER_PAGE;
  const endIndex = Math.min(startIndex + ROWS_PER_PAGE, filteredClaims.length);

  const paginatedClaims = useMemo(
    () => filteredClaims.slice(startIndex, endIndex),
    [filteredClaims, startIndex, endIndex]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Risk Filter Pills */}
      <div className="border-b px-4 py-3" style={{ borderColor: '#27272a', backgroundColor: '#18181b' }}>
        <div className="flex flex-wrap gap-2">
          {RISK_FILTERS.map((filter) => {
            const count = filter.value === 'all'
              ? claims.length
              : claims.filter((c) => c.result?.riskLevel === filter.value).length;

            const isActive = selectedRiskFilter === filter.value;

            const getButtonStyle = () => {
              if (isActive) {
                switch (filter.value) {
                  case 'all':
                    return 'bg-zinc-700 text-zinc-100 border-zinc-600';
                  case 'low':
                    return 'bg-green-500/20 text-green-400 border-green-500/50';
                  case 'moderate':
                    return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
                  case 'high':
                    return 'bg-red-500/20 text-red-400 border-red-500/50';
                  default:
                    return '';
                }
              } else {
                switch (filter.value) {
                  case 'all':
                    return 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300';
                  case 'low':
                    return 'border-green-500/30 text-green-500/70 hover:border-green-500/50 hover:text-green-400';
                  case 'moderate':
                    return 'border-orange-500/30 text-orange-500/70 hover:border-orange-500/50 hover:text-orange-400';
                  case 'high':
                    return 'border-red-500/30 text-red-500/70 hover:border-red-500/50 hover:text-red-400';
                  default:
                    return '';
                }
              }
            };

            return (
              <button
                key={filter.value}
                onClick={() => setSelectedRiskFilter(filter.value)}
                className={cn(
                  'px-3 py-1 rounded-full border text-xs font-medium transition-colors',
                  getButtonStyle()
                )}
              >
                {filter.label}
                <span className="ml-1.5 opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead
            className="sticky top-0 z-10 border-b"
            style={{ backgroundColor: '#18181b', borderColor: '#27272a' }}
          >
            <tr>
              <th className="h-12 w-[120px] px-4 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Claim #
              </th>
              {displayColumns.map((key) => (
                <th
                  key={key}
                  className="h-12 px-4 text-left text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500"
                >
                  {key}
                </th>
              ))}
              <th className="h-12 w-[100px] px-4 text-right text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Score
              </th>
              <th className="h-12 w-[120px] px-4 text-right text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Probability
              </th>
              <th className="h-12 w-[100px] px-4 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Risk
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedClaims.map((item, idx) => {
              const absoluteIndex = startIndex + idx;
              // Check if this claim is selected by comparing the claim object
              const isSelected = selectedClaimIndex !== null && claims[selectedClaimIndex] === item;
              return (
                <tr
                  key={absoluteIndex}
                  onClick={() => onClaimSelect(item)}
                  className={cn(
                    'border-b cursor-pointer transition-colors',
                    isSelected
                      ? 'bg-zinc-800 border-l-4 border-l-blue-500'
                      : 'hover:bg-zinc-900 border-l-4 border-l-transparent'
                  )}
                  style={{ borderBottomColor: '#27272a' }}
                >
                  <td className="px-4 py-3 font-mono text-sm text-zinc-100">
                    {claimNumberColumn ? item.claim[claimNumberColumn] || '-' : `#${absoluteIndex + 1}`}
                  </td>
                  {displayColumns.map((key) => (
                    <td key={key} className="px-4 py-3 text-sm text-zinc-300">
                      {String(item.claim[key] ?? '-')}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right font-mono text-sm text-zinc-100">
                    {item.result ? item.result.totalScore.toFixed(3) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-zinc-100">
                    {item.result ? `${(item.result.probability * 100).toFixed(1)}%` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {item.result ? (
                      <RiskBadge riskLevel={item.result.riskLevel} size="xs" />
                    ) : isProcessing ? (
                      <span className="text-xs text-zinc-500">Processing...</span>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer with pagination */}
      <div
        className="flex flex-col gap-2 border-t p-4 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderColor: '#27272a', backgroundColor: '#18181b' }}
      >
        <div className="text-sm text-zinc-400">
          Showing <span className="font-medium text-zinc-100">{startIndex + 1}</span>-
          <span className="font-medium text-zinc-100">{endIndex}</span> of{' '}
          <span className="font-medium text-zinc-100">{filteredClaims.length}</span>
          {selectedRiskFilter !== 'all' && (
            <span className="text-xs text-zinc-500">
              {' '}
              ({selectedRiskFilter} risk)
            </span>
          )}
          {totalUnfilteredCount && filteredClaims.length < totalUnfilteredCount && (
            <span className="text-xs text-zinc-500">
              {' '}
              (filtered from {totalUnfilteredCount})
            </span>
          )}{' '}
          claims
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="h-8 border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
          >
            Previous
          </Button>
          <span className="text-sm text-zinc-400">
            Page <span className="font-medium text-zinc-100">{page}</span> of{' '}
            <span className="font-medium text-zinc-100">{totalPages}</span>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="h-8 border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
