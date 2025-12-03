import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Dimension } from '@/lib/db/operations';
import AlignmentTableRow from './AlignmentTableRow';

interface AlignmentTableProps {
  alignmentMapping: Record<string, string> | null;
  dimensions: Dimension[];
  editMode: boolean;
  editableAlignment: Record<string, string>;
  onDimensionChange: (originalCol: string, newDim: string) => void;
}

const ITEMS_PER_PAGE = 10;

export default function AlignmentTable({
  alignmentMapping,
  dimensions,
  editMode,
  editableAlignment,
  onDimensionChange,
}: AlignmentTableProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const entries = useMemo(() =>
    Object.entries(alignmentMapping || {}).sort((a, b) => a[0].localeCompare(b[0])),
    [alignmentMapping]
  );

  const paginatedEntries = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE;
    return entries.slice(start, start + ITEMS_PER_PAGE);
  }, [entries, currentPage]);

  const totalPages = Math.ceil(entries.length / ITEMS_PER_PAGE);

  if (!alignmentMapping || entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No alignment mapping available
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Original Column</th>
              <th className="px-4 py-3 text-left font-semibold">Matched Dimension</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEntries.map(([originalCol, matchedDim]) => (
              <AlignmentTableRow
                key={originalCol}
                originalColumn={originalCol}
                matchedDimension={matchedDim}
                dimensions={dimensions}
                editMode={editMode}
                currentValue={editMode ? editableAlignment[originalCol] : matchedDim}
                onDimensionChange={onDimensionChange}
              />
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground font-mono">
            Showing {currentPage * ITEMS_PER_PAGE + 1} to{' '}
            {Math.min((currentPage + 1) * ITEMS_PER_PAGE, entries.length)} of {entries.length} columns
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
