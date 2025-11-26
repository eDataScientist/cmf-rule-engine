import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Database, X } from 'lucide-react';
import { PageHeader } from '@/components/shared/Layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TreeForm } from './components/TreeForm';
import { getDatasets, type DatasetWithStatus } from '@/lib/db/operations';

interface DatasetContext {
  id: number;
  name: string;
  company: string;
  country: string;
}

export default function GenerateTree() {
  const location = useLocation();
  const navigationDataset = (location.state as any)?.fromDataset as DatasetContext | undefined;

  const [datasets, setDatasets] = useState<DatasetWithStatus[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(navigationDataset?.id ?? null);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    }
  }

  // Get selected dataset context
  const datasetContext: DatasetContext | undefined = selectedDatasetId
    ? datasets.find(d => d.id === selectedDatasetId)
      ? {
          id: selectedDatasetId,
          name: datasets.find(d => d.id === selectedDatasetId)!.fileName || `Dataset ${selectedDatasetId}`,
          company: datasets.find(d => d.id === selectedDatasetId)!.insuranceCompany,
          country: datasets.find(d => d.id === selectedDatasetId)!.country,
        }
      : undefined
    : undefined;

  return (
    <div className='flex gap-6 flex-col'>
      <PageHeader
        title="Generate Tree"
        description="Parse and create a new decision tree from FIGS format"
      />

      {/* Dataset Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle>Dataset Association (Optional)</CardTitle>
          <CardDescription>
            Select a dataset to associate with this tree, or leave blank to create a standalone tree
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Select
                value={selectedDatasetId?.toString() ?? ''}
                onChange={(e) => setSelectedDatasetId(e.target.value ? Number(e.target.value) : null)}
                options={[
                  { value: '', label: '(No dataset - standalone tree)' },
                  ...datasets.map(d => ({
                    value: d.id.toString(),
                    label: `${d.fileName || `Dataset ${d.id}`} - ${d.insuranceCompany} - ${d.country}`
                  }))
                ]}
                disabled={loading}
              />
            </div>
            {selectedDatasetId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDatasetId(null)}
                title="Clear selection"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Dataset Info Banner */}
      {datasetContext && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Creating tree for dataset</p>
                <p className="text-sm text-muted-foreground">
                  {datasetContext.name} • {datasetContext.company} • {datasetContext.country}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <TreeForm datasetContext={datasetContext} />
    </div>
  );
}
