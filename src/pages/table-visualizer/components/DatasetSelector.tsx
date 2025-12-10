import { useState, useEffect } from 'react';
import { Database, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { getDatasets, type DatasetWithStatus } from '@/lib/db/operations';
import { downloadRawDataset } from '@/lib/storage/helpers';

interface DatasetSelectorProps {
  onDatasetSelect: (file: File, datasetName: string) => Promise<void>;
  isLoading: boolean;
}

export function DatasetSelector({ onDatasetSelect, isLoading }: DatasetSelectorProps) {
  const [datasets, setDatasets] = useState<DatasetWithStatus[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(null);
  const [loadingDatasets, setLoadingDatasets] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadDatasets();
  }, []);

  async function loadDatasets() {
    try {
      const data = await getDatasets();
      setDatasets(data);
    } catch (err) {
      console.error('Failed to load datasets:', err);
    } finally {
      setLoadingDatasets(false);
    }
  }

  async function handleLoadDataset() {
    if (!selectedDatasetId) return;

    const dataset = datasets.find(d => d.id === selectedDatasetId);
    if (!dataset?.rawFilePath) {
      alert('No raw file available for this dataset');
      return;
    }

    setDownloading(true);
    try {
      // Download raw CSV from storage
      const blob = await downloadRawDataset(dataset.rawFilePath);

      // Convert blob to File
      const file = new File(
        [blob],
        dataset.fileName || `dataset_${dataset.id}.csv`,
        { type: 'text/csv' }
      );

      // Pass to parent component
      await onDatasetSelect(file, dataset.fileName || `Dataset ${dataset.id}`);
    } catch (err) {
      console.error('Failed to load dataset:', err);
      alert('Failed to load dataset from storage');
    } finally {
      setDownloading(false);
    }
  }

  const selectedDataset = datasets.find(d => d.id === selectedDatasetId);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Select
          value={selectedDatasetId?.toString() ?? ''}
          onChange={(e) => setSelectedDatasetId(e.target.value ? Number(e.target.value) : null)}
          options={[
            { value: '', label: '-- Select a dataset --' },
            ...datasets.map(d => ({
              value: d.id.toString(),
              label: `${d.fileName || `Dataset ${d.id}`} - ${d.insuranceCompany} - ${d.country} (${d.rows} rows)`
            }))
          ]}
          disabled={loadingDatasets || isLoading || downloading}
        />

        {selectedDataset && (
          <div className="rounded border p-2" style={{ borderColor: '#3f3f46', backgroundColor: '#27272a' }}>
            <div className="flex items-start gap-2">
              <Database className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-zinc-100">
                  {selectedDataset.fileName || `Dataset #${selectedDataset.id}`}
                </p>
                <div className="mt-1 space-y-0.5">
                  <p className="text-[10px] text-zinc-400">
                    <span className="font-medium">Company:</span> {selectedDataset.insuranceCompany}
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    <span className="font-medium">Country:</span> {selectedDataset.country}
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    <span className="font-medium">Size:</span> {selectedDataset.rows} rows × {selectedDataset.columns} columns
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleLoadDataset}
          disabled={!selectedDatasetId || isLoading || downloading}
          className="w-full h-8"
          size="sm"
        >
          {downloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Load Dataset
            </>
          )}
        </Button>
      </div>

      {loadingDatasets && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
          <span className="text-sm text-muted-foreground">Loading datasets...</span>
        </div>
      )}
    </div>
  );
}
