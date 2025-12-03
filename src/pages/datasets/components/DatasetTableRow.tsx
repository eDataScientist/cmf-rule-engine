import { Link } from 'react-router-dom';
import { FileText, Eye, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type DatasetWithStatus } from '@/lib/db/operations';
import StatusBadge from './StatusBadge';
import SourceBadge from './SourceBadge';

interface DatasetTableRowProps {
  dataset: DatasetWithStatus;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

export default function DatasetTableRow({ dataset, onDelete, isDeleting }: DatasetTableRowProps) {
  const formattedDate = dataset.uploadedAt || dataset.createdAt
    ? new Date(dataset.uploadedAt || dataset.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '-';

  const status = dataset.uploadStatus?.status || 'ready';

  return (
    <tr className="border-b border-[var(--color-border-subtle)] hover:bg-zinc-900 transition-colors">
      {/* NAME */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-zinc-400 flex-shrink-0" />
          <span className="font-medium">
            {dataset.nickname || dataset.fileName || `Dataset #${dataset.id}`}
          </span>
        </div>
      </td>

      {/* DIMENSIONS */}
      <td className="py-3 px-4 font-mono text-sm text-zinc-300">
        {dataset.rows}R x {dataset.columns}C
      </td>

      {/* SOURCE */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <SourceBadge text={dataset.insuranceCompany} />
          <SourceBadge text={dataset.country} />
        </div>
      </td>

      {/* STATUS */}
      <td className="py-3 px-4">
        <StatusBadge status={status as any} />
      </td>

      {/* UPLOADED */}
      <td className="py-3 px-4 font-mono text-sm text-zinc-300">
        {formattedDate}
      </td>

      {/* ACTIONS */}
      <td className="py-3 px-4">
        <div className="flex items-center justify-end gap-2">
          {status === 'uploaded' && (
            <Link to={`/datasets/${dataset.id}`}>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(dataset.id)}
            disabled={isDeleting}
            className="h-8 px-2"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </td>
    </tr>
  );
}
