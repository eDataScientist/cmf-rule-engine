import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, Loader2, AlertCircle, CheckCircle2, Trash2, Plus, Activity, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDataset, deleteDataset, getDatasetColumnMappings, getDatasetTreeAssociations, type DatasetWithStatus, type DimensionMapping, type TreeAssociation } from '@/lib/db/operations';
import { getRawDatasetUrl, getAlignedDatasetUrl, downloadAlignedDataset } from '@/lib/storage/helpers';
import { supabase } from '@/lib/db/supabase';

interface QualityMetrics {
  dataset_id: number;
  total_dimensions: number;
  present_dimensions: number;
  completeness_percentage: number;
  missing_critical_columns: string[];
  critical_completeness_percentage: number;
  quality_score: number;
}

export default function DatasetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState<DatasetWithStatus | null>(null);
  const [quality, setQuality] = useState<QualityMetrics | null>(null);
  const [mappings, setMappings] = useState<DimensionMapping[]>([]);
  const [associations, setAssociations] = useState<TreeAssociation[]>([]);
  const [previewData, setPreviewData] = useState<{ headers: string[]; rows: Record<string, string>[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingQuality, setLoadingQuality] = useState(true);
  const [loadingMappings, setLoadingMappings] = useState(true);
  const [loadingAssociations, setLoadingAssociations] = useState(true);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    loadDataset();
    loadQualityMetrics();
    loadColumnMappings();
    loadTreeAssociations();
  }, [id]);

  async function loadDataset() {
    try {
      const data = await getDataset(Number(id));
      if (!data) {
        setError('Dataset not found');
        return;
      }
      setDataset(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dataset');
    } finally {
      setLoading(false);
    }
  }

  async function loadQualityMetrics() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-dataset-quality`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dataset_id: Number(id) }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch quality metrics');
      }

      const data = await response.json();
      setQuality(data);
    } catch (err) {
      console.error('Failed to load quality metrics:', err);
    } finally {
      setLoadingQuality(false);
    }
  }

  async function loadColumnMappings() {
    try {
      const data = await getDatasetColumnMappings(Number(id));
      setMappings(data);
    } catch (err) {
      console.error('Failed to load column mappings:', err);
    } finally {
      setLoadingMappings(false);
    }
  }

  async function loadTreeAssociations() {
    try {
      const data = await getDatasetTreeAssociations(Number(id));
      setAssociations(data);
    } catch (err) {
      console.error('Failed to load tree associations:', err);
    } finally {
      setLoadingAssociations(false);
    }
  }

  async function loadDataPreview() {
    if (!dataset?.alignedFilePath || loadingPreview || previewData) return;

    setLoadingPreview(true);
    try {
      const blob = await downloadAlignedDataset(dataset.alignedFilePath);
      const text = await blob.text();

      // Parse CSV manually (simple parser for preview)
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length === 0) {
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const rows = lines.slice(1, 11).map(line => {
        // Simple CSV parsing (handles basic cases)
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      setPreviewData({ headers, rows });
    } catch (err) {
      console.error('Failed to load data preview:', err);
    } finally {
      setLoadingPreview(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this dataset? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await deleteDataset(Number(id));
      navigate('/datasets');
    } catch (err) {
      console.error('Failed to delete dataset:', err);
      alert('Failed to delete dataset');
      setDeleting(false);
    }
  }

  async function handleDownload(type: 'raw' | 'aligned') {
    if (!dataset) return;

    try {
      const filePath = type === 'raw' ? dataset.rawFilePath : dataset.alignedFilePath;
      if (!filePath) {
        alert(`No ${type} file available`);
        return;
      }

      const url = type === 'raw'
        ? await getRawDatasetUrl(filePath)
        : await getAlignedDatasetUrl(filePath);

      window.open(url, '_blank');
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download file');
    }
  }

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
              <Button className="mt-4" variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Datasets
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/datasets')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Datasets
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Dataset
            </>
          )}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Dataset Info */}
        <Card>
          <CardHeader>
            <CardTitle>{dataset.nickname || dataset.fileName || `Dataset #${dataset.id}`}</CardTitle>
            <CardDescription>
              {dataset.insuranceCompany} • {dataset.country} • {dataset.rows} rows • {dataset.columns} columns
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Quality Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Data Quality Metrics</CardTitle>
            <CardDescription>
              Analysis of data completeness and quality
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingQuality ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : quality ? (
              <div className="space-y-6">
                {/* Quality Score */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border p-4">
                    <div className="text-sm font-medium text-muted-foreground">Overall Quality Score</div>
                    <div className="mt-2 text-3xl font-bold">{quality.quality_score}%</div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-sm font-medium text-muted-foreground">Completeness</div>
                    <div className="mt-2 text-3xl font-bold">{quality.completeness_percentage}%</div>
                    <div className="text-xs text-muted-foreground">
                      {quality.present_dimensions} of {quality.total_dimensions} columns
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-sm font-medium text-muted-foreground">Critical Completeness</div>
                    <div className="mt-2 text-3xl font-bold">{quality.critical_completeness_percentage}%</div>
                  </div>
                </div>

                {/* Missing Critical Columns */}
                {quality.missing_critical_columns.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-medium text-destructive">Missing Critical Columns</h4>
                    <div className="flex flex-wrap gap-2">
                      {quality.missing_critical_columns.map((col) => (
                        <span
                          key={col}
                          className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive"
                        >
                          <AlertCircle className="h-3 w-3" />
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {quality.missing_critical_columns.length === 0 && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    All critical columns are present
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                Quality metrics not available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Column Alignment Mapping */}
        <Card>
          <CardHeader>
            <CardTitle>Column Alignment Mapping</CardTitle>
            <CardDescription>
              Columns matched to standard dimensions during processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingMappings ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : mappings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Dimension</th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Data Type</th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappings.map((mapping) => (
                      <tr key={mapping.dimensionId} className="border-b last:border-0">
                        <td className="py-3 text-sm font-medium">
                          {mapping.displayName}
                          {mapping.isCritical && (
                            <span className="ml-2 inline-flex items-center rounded-md bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                              Critical
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">
                          {mapping.category}
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">
                          {mapping.dataType}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1 text-sm text-green-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Matched
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground">
                No column mappings available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tree Associations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tree Associations</CardTitle>
                <CardDescription>
                  Decision trees evaluated with this dataset
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/generate-tree', {
                  state: {
                    fromDataset: {
                      id: dataset.id,
                      name: dataset.nickname || dataset.fileName || `Dataset #${dataset.id}`,
                      company: dataset.insuranceCompany,
                      country: dataset.country
                    }
                  }
                })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Tree
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingAssociations ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : associations.length > 0 ? (
              <div className="space-y-3">
                {associations.map((assoc) => (
                  <div key={assoc.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      {assoc.treeType === 'motor' ? (
                        <Activity className="h-5 w-5 text-primary" />
                      ) : (
                        <Heart className="h-5 w-5 text-primary" />
                      )}
                      <div>
                        <h4 className="font-medium">{assoc.treeName}</h4>
                        <p className="text-sm text-muted-foreground">
                          Evaluated {new Date(assoc.evaluatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/tree-visualizer/${assoc.treeId}`}>
                        <Button variant="outline" size="sm">
                          View Tree
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">
                  No trees have been evaluated with this dataset yet
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/generate-tree', {
                    state: {
                      fromDataset: {
                        id: dataset.id,
                        name: dataset.nickname || dataset.fileName || `Dataset #${dataset.id}`,
                        company: dataset.insuranceCompany,
                        country: dataset.country
                      }
                    }
                  })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Tree
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Data Preview</CardTitle>
                <CardDescription>
                  First 10 rows of the aligned dataset
                </CardDescription>
              </div>
              {!previewData && !loadingPreview && (
                <Button onClick={loadDataPreview} variant="outline" size="sm">
                  Load Preview
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loadingPreview ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : previewData ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {previewData.headers.map((header, index) => (
                        <th key={index} className="pb-3 pr-4 text-left font-medium text-muted-foreground">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b last:border-0">
                        {previewData.headers.map((header, colIndex) => (
                          <td key={colIndex} className="py-2 pr-4 text-muted-foreground">
                            {row[header] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-3 text-xs text-muted-foreground">
                  Showing {previewData.rows.length} of {dataset.rows} rows
                </p>
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground">
                Click "Load Preview" to view sample data
              </div>
            )}
          </CardContent>
        </Card>

        {/* Download Files */}
        <Card>
          <CardHeader>
            <CardTitle>Download Files</CardTitle>
            <CardDescription>
              Download raw or aligned dataset files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button
                onClick={() => handleDownload('raw')}
                disabled={!dataset.rawFilePath}
                variant="outline"
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Raw Data
              </Button>
              <Button
                onClick={() => handleDownload('aligned')}
                disabled={!dataset.alignedFilePath}
                variant="outline"
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Aligned Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
