import { ChevronUp, ChevronDown, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type DatasetWithStatus } from '@/lib/db/operations';
import DatasetTableRow from './DatasetTableRow';

interface DatasetTableProps {
  datasets: DatasetWithStatus[];
  onDelete: (id: number) => void;
  deletingId: number | null;
  sortConfig: { column: string; direction: 'asc' | 'desc' };
  onSort: (column: string) => void;
  onUploadClick: () => void;
}

export default function DatasetTable({
  datasets,
  onDelete,
  deletingId,
  sortConfig,
  onSort,
  onUploadClick,
}: DatasetTableProps) {
  const getSortIcon = (column: string) => {
    if (sortConfig.column !== column) {
      return null;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="h-3 w-3 ml-1 inline" />
    ) : (
      <ChevronDown className="h-3 w-3 ml-1 inline" />
    );
  };

  // Empty state
  if (datasets.length === 0) {
    return (
      <div className="border border-dashed border-[var(--color-border-subtle)] rounded-md">
        <div className="flex min-h-[300px] flex-col items-center justify-center text-center p-8">
          <Database className="h-12 w-12 text-zinc-600 mb-4" />
          <h3 className="text-lg font-medium text-zinc-300 mb-2">No datasets yet</h3>
          <p className="text-sm text-zinc-500 mb-4 max-w-sm">
            Upload your first claims dataset to get started
          </p>
          <Button onClick={onUploadClick}>Upload Dataset</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col border border-[var(--color-border-subtle)] rounded-md overflow-hidden" style={{ height: 'calc(100vh - 240px)' }}>
      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead className="bg-zinc-900 sticky top-0 z-10">
            <tr>
              <th className="text-left py-3 px-4 text-xs font-medium text-zinc-400 uppercase">
                <button
                  onClick={() => onSort('name')}
                  className="flex items-center hover:text-zinc-200 transition-colors"
                >
                  Name
                  {getSortIcon('name')}
                </button>
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-zinc-400 uppercase w-[120px]">
                <button
                  onClick={() => onSort('dimensions')}
                  className="flex items-center hover:text-zinc-200 transition-colors"
                >
                  Dimensions
                  {getSortIcon('dimensions')}
                </button>
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-zinc-400 uppercase w-[200px]">
                Source
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-zinc-400 uppercase w-[100px]">
                Status
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-zinc-400 uppercase w-[120px]">
                <button
                  onClick={() => onSort('uploaded')}
                  className="flex items-center hover:text-zinc-200 transition-colors"
                >
                  Uploaded
                  {getSortIcon('uploaded')}
                </button>
              </th>
              <th className="text-right py-3 px-4 text-xs font-medium text-zinc-400 uppercase w-[80px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {datasets.map((dataset) => (
              <DatasetTableRow
                key={dataset.id}
                dataset={dataset}
                onDelete={onDelete}
                isDeleting={deletingId === dataset.id}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="border-t border-[var(--color-border-subtle)] bg-zinc-900 px-4 py-3">
        <p className="text-sm text-zinc-400">
          Showing {datasets.length} of {datasets.length} file{datasets.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
