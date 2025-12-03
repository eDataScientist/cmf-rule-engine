import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { getRawDatasetUrl, getAlignedDatasetUrl } from '@/lib/storage/helpers';
import { useDatasetDetails } from './hooks/useDatasetDetails';
import { useQualityMetrics } from './hooks/useQualityMetrics';
import { useTreeAssociations } from './hooks/useTreeAssociations';
import { useDimensions } from './hooks/useDimensions';
import { useDataPreview } from './hooks/useDataPreview';
import { useAlignmentEditor } from './hooks/useAlignmentEditor';
import { useDatasetDelete } from './hooks/useDatasetDelete';
import { useAlignmentSave } from './hooks/useAlignmentSave';
import DatasetHeader from './components/DatasetHeader';
import OverviewTab from './components/OverviewTab';
import DataGridTab from './components/DataGridTab';
import SchemaMapTab from './components/SchemaMapTab';

export default function DatasetDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');

  const { dataset, loading, error, updateDataset } = useDatasetDetails(id);
  const { quality, loading: loadingQuality } = useQualityMetrics(id);
  const { associations, loading: loadingAssociations, refetch: refetchAssociations } = useTreeAssociations(id);
  const { dimensions, loading: loadingDimensions } = useDimensions();
  const { previewData, loading: loadingPreview, loadPreview, currentPage, totalPages, totalRows, nextPage, prevPage, pageSize } = useDataPreview(dataset);
  const { handleDelete, deleting } = useDatasetDelete(id);
  const { editMode, editableAlignment, validationError, hasChanges, startEdit, cancelEdit, handleDimensionChange, validate } = useAlignmentEditor(dataset);

  const { saveAlignment, saving } = useAlignmentSave(
    id,
    dataset,
    previewData,
    (newAlignment) => {
      if (dataset) {
        updateDataset({ ...dataset, alignmentMapping: newAlignment });
      }
      cancelEdit();
    },
    () => loadPreview(0)
  );

  const handleSave = async () => {
    if (!validate()) return;
    await saveAlignment(editableAlignment, hasChanges);
  };

  const handleDownload = async (type: 'raw' | 'aligned') => {
    if (!dataset) return;
    try {
      const filePath = type === 'raw' ? dataset.rawFilePath : dataset.alignedFilePath;
      if (!filePath) return alert(`No ${type} file available`);

      const url = type === 'raw' ? await getRawDatasetUrl(filePath) : await getAlignedDatasetUrl(filePath);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download file');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h3 className="mt-4 text-lg font-medium">{error || 'Dataset not found'}</h3>
            <Link to="/datasets">
              <Button className="mt-4" variant="outline">Back to Datasets</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <DatasetHeader
        dataset={dataset}
        onDelete={handleDelete}
        onDownloadRaw={() => handleDownload('raw')}
        onDownloadAligned={() => handleDownload('aligned')}
        deleting={deleting}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="data-grid">Data Grid</TabsTrigger>
          <TabsTrigger value="schema-map">Schema Map</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab
            quality={quality}
            loadingQuality={loadingQuality}
            associations={associations}
            loadingAssociations={loadingAssociations}
            datasetId={dataset.id}
            datasetName={dataset.nickname || dataset.fileName || `Dataset #${dataset.id}`}
            onLinkSuccess={refetchAssociations}
          />
        </TabsContent>

        <TabsContent value="data-grid">
          <DataGridTab
            dataset={dataset}
            previewData={previewData}
            loadingPreview={loadingPreview}
            onLoadPreview={() => loadPreview(0)}
            currentPage={currentPage}
            totalPages={totalPages}
            totalRows={totalRows}
            pageSize={pageSize}
            onNextPage={nextPage}
            onPrevPage={prevPage}
          />
        </TabsContent>

        <TabsContent value="schema-map">
          <SchemaMapTab
            dataset={dataset}
            dimensions={dimensions}
            loadingDimensions={loadingDimensions}
            editMode={editMode}
            editableAlignment={editableAlignment}
            validationError={validationError}
            hasChanges={hasChanges}
            saving={saving}
            onEditStart={startEdit}
            onEditCancel={cancelEdit}
            onSave={handleSave}
            onDimensionChange={handleDimensionChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
