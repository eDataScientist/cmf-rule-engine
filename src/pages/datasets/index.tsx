import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Database, Upload, Trash2, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getDatasets, deleteDataset, type DatasetWithStatus } from '@/lib/db/operations';
import { supabase } from '@/lib/db/supabase';

export default function Datasets() {
  const [datasets, setDatasets] = useState<DatasetWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

  function getStatusBadge(status: string) {
    const styles = {
      uploading: 'bg-blue-100 text-blue-800',
      processing: 'bg-yellow-100 text-yellow-800',
      uploaded: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status as keyof typeof styles] || styles.uploaded}`}>
        {status === 'uploading' || status === 'processing' ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : null}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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
          <p className="mt-1 text-muted-foreground">
            Manage your uploaded claims datasets
          </p>
        </div>
        <Link to="/datasets/upload">
          <Button className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Dataset
          </Button>
        </Link>
      </div>

      {datasets.length === 0 ? (
        <Card className="flex min-h-[300px] items-center justify-center">
          <CardContent className="text-center">
            <Database className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No datasets yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload your first claims dataset to get started
            </p>
            <Link to="/datasets/upload">
              <Button className="mt-4">
                <Upload className="mr-2 h-4 w-4" />
                Upload Dataset
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {datasets.map((dataset) => (
            <Card key={dataset.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">
                      {dataset.nickname || dataset.fileName || `Dataset #${dataset.id}`}
                    </h3>
                    {dataset.uploadStatus && getStatusBadge(dataset.uploadStatus.status)}
                  </div>
                  <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                    <span>{dataset.insuranceCompany}</span>
                    <span>•</span>
                    <span>{dataset.country}</span>
                    <span>•</span>
                    <span>{dataset.rows} rows</span>
                    <span>•</span>
                    <span>{dataset.columns} columns</span>
                  </div>
                  {dataset.datePeriod && (
                    <div className="mt-1 text-sm text-muted-foreground">
                      Period: {dataset.datePeriod}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {dataset.uploadStatus?.status === 'uploaded' && (
                    <Link to={`/datasets/${dataset.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(dataset.id)}
                    disabled={deletingId === dataset.id}
                  >
                    {deletingId === dataset.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
