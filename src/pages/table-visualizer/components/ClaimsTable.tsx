import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { RiskBadge } from '@/components/shared/ScoreCard/RiskBadge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ClaimData } from '@/lib/types/claim';
import type { TraceResult } from '@/lib/types/trace';

type RiskLevel = 'low' | 'moderate' | 'high';

interface ClaimWithResult {
  claim: ClaimData;
  result?: TraceResult;
}

interface ClaimsTableProps {
  claims: ClaimWithResult[];
  requiredColumns?: string[];
  isProcessing?: boolean;
  onRowClick?: (claim: ClaimData) => void;
}

const ROWS_PER_PAGE = 10;
const RISK_FILTERS: { label: string; value: RiskLevel | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Low', value: 'low' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'High', value: 'high' },
];

export function ClaimsTable({ claims, requiredColumns, isProcessing, onRowClick }: ClaimsTableProps) {
  if (claims.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No claims data loaded</p>
      </Card>
    );
  }

  // Use required columns if provided, otherwise show all columns except Claim Number
  const displayColumns = requiredColumns
    ? requiredColumns.filter((col) => col !== 'Claim Number').sort()
    : Array.from(
        new Set(claims.flatMap((c) => Object.keys(c.claim)))
      ).filter((key) => key !== 'Claim Number');

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
    <Card className="overflow-hidden">
      {/* Risk Level Filter Buttons */}
      <div className="border-b border-border/60 bg-muted/30 p-4">
        <p className="mb-3 text-sm font-medium text-foreground">Filter by Risk Level:</p>
        <div className="flex flex-wrap gap-2">
          {RISK_FILTERS.map((filter) => {
            const getButtonColor = () => {
              if (selectedRiskFilter === filter.value) return '';
              switch (filter.value) {
                case 'all':
                  return 'bg-slate-100 hover:bg-slate-200';
                case 'low':
                  return 'bg-green-100 hover:bg-green-200 text-green-900 border-green-300';
                case 'moderate':
                  return 'bg-yellow-100 hover:bg-yellow-200 text-yellow-900 border-yellow-300';
                case 'high':
                  return 'bg-red-100 hover:bg-red-200 text-red-900 border-red-300';
                default:
                  return '';
              }
            };

            return (
              <Button
                key={filter.value}
                variant={selectedRiskFilter === filter.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRiskFilter(filter.value)}
                className={cn(
                  'transition-colors',
                  selectedRiskFilter === filter.value && 'shadow-md',
                  selectedRiskFilter !== filter.value && getButtonColor()
                )}
              >
                {filter.label}
                {filter.value !== 'all' && (
                  <span className="ml-2 text-xs">
                    ({claims.filter((c) => c.result?.riskLevel === filter.value).length})
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="relative">
        <div className="max-h-[600px] overflow-auto">
          <table className="w-full min-w-[960px] border-collapse text-sm">
            <thead className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
              <tr className="border-b border-border/60">
                <th className="h-12 w-[120px] px-4 text-left font-semibold uppercase tracking-wide text-xs text-muted-foreground">
                  Claim #
                </th>
                {displayColumns.map((key) => (
                  <th
                    key={key}
                    className="h-12 px-4 text-left font-mono text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {key}
                  </th>
                ))}
                <th className="h-12 w-[100px] px-4 text-right font-semibold uppercase tracking-wide text-xs text-muted-foreground">
                  Score
                </th>
                <th className="h-12 w-[120px] px-4 text-right font-semibold uppercase tracking-wide text-xs text-muted-foreground">
                  Probability
                </th>
                <th className="h-12 w-[100px] px-4 text-left font-semibold uppercase tracking-wide text-xs text-muted-foreground">
                  Risk
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedClaims.map((item, idx) => {
                const absoluteIndex = startIndex + idx;
                return (
                  <tr
                    key={absoluteIndex}
                    onClick={() => onRowClick?.(item.claim)}
                    className={cn(
                      'border-b border-border/40 transition-colors hover:bg-muted/40',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    <td className="px-4 py-3 font-mono text-sm text-foreground">
                      {item.claim['Claim Number'] || `#${absoluteIndex + 1}`}
                    </td>
                    {displayColumns.map((key) => (
                      <td key={key} className="px-4 py-3 text-sm text-foreground">
                        {String(item.claim[key] ?? '-')}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right font-mono text-sm text-foreground">
                      {item.result ? item.result.totalScore.toFixed(3) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-foreground">
                      {item.result ? `${(item.result.probability * 100).toFixed(1)}%` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {item.result ? (
                        <RiskBadge riskLevel={item.result.riskLevel} size="xs" />
                      ) : isProcessing ? (
                        <span className="text-xs text-muted-foreground">Processing...</span>
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
      </div>
      <div className="flex flex-col gap-2 border-t border-border/60 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{startIndex + 1}</span>-
          <span className="font-medium">{endIndex}</span> of{' '}
          <span className="font-medium">{filteredClaims.length}</span>
          {selectedRiskFilter !== 'all' && (
            <>
              {' '}
              <span className="text-xs text-muted-foreground/70">
                ({selectedRiskFilter} risk)
              </span>
            </>
          )}{' '}
          claims
          {filteredClaims.length < claims.length && (
            <span className="ml-2 text-xs text-muted-foreground/70">
              ({claims.length} total)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page <span className="font-medium text-foreground">{page}</span> of{' '}
            <span className="font-medium text-foreground">{totalPages}</span>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}
