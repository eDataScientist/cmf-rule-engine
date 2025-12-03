import { useEffect, useState } from 'react';
import { Database, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getDatasets, deleteDataset, type DatasetWithStatus } from '@/lib/db/operations';
import { supabase } from '@/lib/db/supabase';
import DatasetTable from './components/DatasetTable';
import UploadModal from './components/UploadModal';
import { useDatasetSort } from './hooks/useDatasetSort';

export default function Datasets() {
  const [datasets, setDatasets] = useState<DatasetWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const { sortedDatasets, sortConfig, handleSort } = useDatasetSort(datasets);

  useEffect(() => {
    loadDatasets();

    // Subscribe to dataset_upload_status changes for realtime updates
    const channel = supabase
      .channel('datasets-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dataset_upload_status',
        },
        () => {
          // Reload datasets when any upload status changes
          loadDatasets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadDatasets() {
    try {
      const data = await getDatasets();
      setDatasets(data);
    } catch (error) {
      console.error('Failed to load datasets:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this dataset?')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteDataset(id);
      setDatasets(datasets.filter((d) => d.id !== id));
    } catch (error) {
      console.error('Failed to delete dataset:', error);
      alert('Failed to delete dataset');
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Database className="h-8 w-8" />
            Datasets
          </h1>
          <p className="mt-1 text-zinc-400 text-sm">
            Manage your uploaded claims datasets
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Search box (visual only) */}
          <div className="relative">
            <Input
              placeholder="Search files..."
              className="h-9 bg-black border-zinc-800 pr-16 w-64"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-zinc-700 bg-zinc-900 px-1.5 font-mono text-[10px] font-medium text-zinc-400">
              ⌘K
            </kbd>
          </div>
          {/* Upload button */}
          <Button onClick={() => setUploadModalOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Dataset
          </Button>
        </div>
      </div>

      <DatasetTable
        datasets={sortedDatasets}
        onDelete={handleDelete}
        deletingId={deletingId}
        sortConfig={sortConfig}
        onSort={handleSort}
        onUploadClick={() => setUploadModalOpen(true)}
      />

      <UploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => setUploadModalOpen(false)}
      />
    </div>
  );
}
