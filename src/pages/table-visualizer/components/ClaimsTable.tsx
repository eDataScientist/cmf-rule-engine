import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { RiskBadge } from '@/components/shared/ScoreCard/RiskBadge';
import { Button } from '@/components/ui/button';
import type { ClaimData } from '@/lib/types/claim';
import type { TraceResult } from '@/lib/types/trace';

interface ClaimWithResult {
  claim: ClaimData;
  result?: TraceResult;
}

interface ClaimsTableProps {
  claims: ClaimWithResult[];
  requiredColumns?: string[];
  isProcessing?: boolean;
}

const ROWS_PER_PAGE = 10;

export function ClaimsTable({ claims, requiredColumns, isProcessing }: ClaimsTableProps) {
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

  useEffect(() => {
    setPage(1);
  }, [claims.length]);

  useEffect(() => {
    setPage((prev) => {
      const totalPages = Math.max(1, Math.ceil(claims.length / ROWS_PER_PAGE));
      return Math.min(prev, totalPages);
    });
  }, [claims.length]);

  const totalPages = Math.max(1, Math.ceil(claims.length / ROWS_PER_PAGE));
  const startIndex = (page - 1) * ROWS_PER_PAGE;
  const endIndex = Math.min(startIndex + ROWS_PER_PAGE, claims.length);

  const paginatedClaims = useMemo(
    () => claims.slice(startIndex, endIndex),
    [claims, startIndex, endIndex]
  );

  return (
    <Card className="overflow-hidden">
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
                    className="border-b border-border/40 transition-colors hover:bg-muted/40"
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
                        <RiskBadge riskLevel={item.result.riskLevel} size="sm" />
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
          <span className="font-medium">{claims.length}</span> claims
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
