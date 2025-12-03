import { Loader2, ChevronLeft, ChevronRight, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DatasetWithStatus } from '@/lib/db/operations';

interface DataGridTabProps {
  dataset: DatasetWithStatus;
  previewData: { headers: string[]; rows: Record<string, string>[] } | null;
  loadingPreview: boolean;
  onLoadPreview: () => void;
  currentPage: number;
  totalPages: number;
  totalRows: number;
  pageSize: number;
  onNextPage: () => void;
  onPrevPage: () => void;
}

export default function DataGridTab({
  dataset,
  previewData,
  loadingPreview,
  onLoadPreview,
  currentPage,
  totalPages,
  totalRows,
  pageSize,
  onNextPage,
  onPrevPage,
}: DataGridTabProps) {
  if (!previewData && !loadingPreview) {
    return (
      <div className="border border-dashed border-[var(--color-border-subtle)] rounded-md">
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center p-8">
          <Database className="h-12 w-12 text-zinc-600 mb-4" />
          <h3 className="text-lg font-medium text-zinc-300 mb-2">Data preview not loaded</h3>
          <p className="text-sm text-zinc-500 mb-4 max-w-sm">
            Click the button below to load and view the dataset rows
          </p>
          <Button onClick={onLoadPreview}>Load Data</Button>
        </div>
      </div>
    );
  }

  if (loadingPreview) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!previewData) return null;

  const startRow = currentPage * pageSize + 1;
  const endRow = Math.min((currentPage + 1) * pageSize, totalRows);
  const sortedHeaders = [...previewData.headers].sort((a, b) => a.localeCompare(b));

  return (
    <div className="flex flex-col border border-[var(--color-border-subtle)] rounded-md overflow-hidden" style={{ height: 'calc(100vh - 340px)' }}>
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-zinc-900 sticky top-0 z-10">
            <tr>
              {sortedHeaders.map((header, index) => (
                <th key={index} className="text-left py-3 px-4 text-xs font-medium text-zinc-400 uppercase whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewData.rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-[var(--color-border-subtle)] hover:bg-zinc-900/50 transition-colors"
              >
                {sortedHeaders.map((header, colIndex) => (
                  <td key={colIndex} className="px-4 py-3 text-sm text-zinc-300 whitespace-nowrap">
                    {row[header] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-[var(--color-border-subtle)] bg-zinc-900 px-4 py-3 flex justify-between items-center">
        <p className="text-sm text-zinc-400">
          Showing rows {startRow}-{endRow} of {totalRows}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevPage}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextPage}
            disabled={currentPage >= totalPages - 1 || totalRows === 0}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
