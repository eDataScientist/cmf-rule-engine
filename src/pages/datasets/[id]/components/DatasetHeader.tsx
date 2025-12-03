import { Link } from 'react-router-dom';
import { Download, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DatasetWithStatus } from '@/lib/db/operations';
import StatusBadge from '@/pages/datasets/components/StatusBadge';
import SourceBadge from '@/pages/datasets/components/SourceBadge';
import { formatRelativeTime } from '../utils/formatRelativeTime';

interface DatasetHeaderProps {
  dataset: DatasetWithStatus;
  onDelete: () => void;
  onDownloadRaw: () => void;
  onDownloadAligned: () => void;
  deleting: boolean;
}

export default function DatasetHeader({
  dataset,
  onDelete,
  onDownloadRaw,
  onDownloadAligned,
  deleting,
}: DatasetHeaderProps) {
  const status = dataset.uploadStatus?.status || 'ready';

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/" className="text-zinc-400 hover:text-foreground">
          Claims
        </Link>
        <span className="text-zinc-600">/</span>
        <Link to="/datasets" className="text-zinc-400 hover:text-foreground">
          Datasets
        </Link>
        <span className="text-zinc-600">/</span>
        <span className="text-foreground">{dataset.fileName || `Dataset #${dataset.id}`}</span>
      </div>

      {/* Title row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">
            {dataset.nickname || dataset.fileName || `Dataset #${dataset.id}`}
          </h1>
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Metadata row */}
      <div className="flex items-center gap-4 text-sm">
        <SourceBadge text={dataset.insuranceCompany} />
        <SourceBadge text={dataset.country} />
        <span className="font-mono text-zinc-400">{dataset.rows} Rows</span>
        <span className="text-zinc-600">•</span>
        <span className="font-mono text-zinc-400">{dataset.columns} Cols</span>
        {dataset.uploadedAt && (
          <>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">
              Uploaded {formatRelativeTime(dataset.uploadedAt)}
            </span>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <div className="flex gap-1 border border-zinc-700 rounded-md overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDownloadRaw}
            disabled={!dataset.rawFilePath}
            className="rounded-none border-r border-zinc-700 hover:bg-zinc-800"
          >
            <Download className="h-4 w-4 mr-1.5" />
            <span className="text-xs">Raw</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDownloadAligned}
            disabled={!dataset.alignedFilePath}
            className="rounded-none hover:bg-zinc-800"
          >
            <Download className="h-4 w-4 mr-1.5" />
            <span className="text-xs">Aligned</span>
          </Button>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={deleting}
        >
          {deleting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              <span className="text-xs">Deleting...</span>
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-1.5" />
              <span className="text-xs">Delete</span>
            </>
          )}
        </Button>
        <Button variant="outline" size="sm" disabled title="Quality metrics auto-update when alignment changes">
          Run Quality Check
        </Button>
      </div>
    </div>
  );
}
