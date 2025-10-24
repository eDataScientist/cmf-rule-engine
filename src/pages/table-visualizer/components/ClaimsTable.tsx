import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { RiskBadge } from '@/components/shared/ScoreCard/RiskBadge';
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

export function ClaimsTable({ claims, requiredColumns, isProcessing }: ClaimsTableProps) {
  if (claims.length === 0) {
    return (
      <Card className="border-white/60 bg-white/80 p-8 text-center shadow-lg shadow-black/5 backdrop-blur">
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

  return (
    <Card className="overflow-hidden border-white/60 bg-white/80 shadow-lg shadow-black/5 backdrop-blur">
      <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-white/85 backdrop-blur">
            <TableRow>
              <TableHead className="w-[120px]">Claim #</TableHead>
              {displayColumns.map((key) => (
                <TableHead key={key} className="font-mono text-xs">
                  {key}
                </TableHead>
              ))}
              <TableHead className="w-[100px] text-right">Score</TableHead>
              <TableHead className="w-[120px] text-right">Probability</TableHead>
              <TableHead className="w-[100px]">Risk</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-mono text-sm">
                  {item.claim['Claim Number'] || `#${idx + 1}`}
                </TableCell>
                {displayColumns.map((key) => (
                  <TableCell key={key} className="text-sm">
                    {String(item.claim[key] ?? '-')}
                  </TableCell>
                ))}
                <TableCell className="text-right font-mono text-sm">
                  {item.result ? item.result.totalScore.toFixed(3) : '-'}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {item.result ? `${(item.result.probability * 100).toFixed(1)}%` : '-'}
                </TableCell>
                <TableCell>
                  {item.result ? (
                    <RiskBadge riskLevel={item.result.riskLevel} size="sm" />
                  ) : isProcessing ? (
                    <span className="text-xs text-muted-foreground">Processing...</span>
                  ) : (
                    '-'
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
