import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, Loader2, AlertCircle, CheckCircle2, Trash2, Plus, Activity, Heart, Edit, Save, X, ChevronLeft, ChevronRight, RefreshCw, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { getDataset, deleteDataset, getDatasetTreeAssociations, getAllDimensions, updateDatasetAlignment, type DatasetWithStatus, type TreeAssociation, type Dimension } from '@/lib/db/operations';
import { getRawDatasetUrl, getAlignedDatasetUrl, downloadAlignedDataset } from '@/lib/storage/helpers';
import { supabase } from '@/lib/db/supabase';
import { LinkTreeDialog } from './components/LinkTreeDialog';

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
  const [associations, setAssociations] = useState<TreeAssociation[]>([]);
  const [previewData, setPreviewData] = useState<{ headers: string[]; rows: Record<string, string>[] } | null>(null);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editableAlignment, setEditableAlignment] = useState<Record<string, string>>({});
  const [originalAlignment, setOriginalAlignment] = useState<Record<string, string>>({});
  const [alignmentPage, setAlignmentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingQuality, setLoadingQuality] = useState(true);
  const [loadingDimensions, setLoadingDimensions] = useState(true);
  const [loadingAssociations, setLoadingAssociations] = useState(true);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  useEffect(() => {
    if (!id) return;

    loadDataset();
    loadQualityMetrics();
    loadDimensions();
    loadTreeAssociations();
  }, [id]);

  // Pagination logic
  const ITEMS_PER_PAGE = 10;
  const alignmentEntries = useMemo(() => {
    if (!dataset?.alignmentMapping) return [];
    // Sort columns alphabetically by original column name
    return Object.entries(dataset.alignmentMapping).sort((a, b) =>
      a[0].localeCompare(b[0])
    );
  }, [dataset?.alignmentMapping]);

  const totalPages = Math.ceil(alignmentEntries.length / ITEMS_PER_PAGE);
  const paginatedEntries = useMemo(() => {
    const start = alignmentPage * ITEMS_PER_PAGE;
    return alignmentEntries.slice(start, start + ITEMS_PER_PAGE);
  }, [alignmentEntries, alignmentPage]);

  // Check if alignment has changed
  const hasChanges = useMemo(() => {
    if (!editMode) return false;

    return JSON.stringify(editableAlignment) !== JSON.stringify(originalAlignment);
  }, [editMode, editableAlignment, originalAlignment]);

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

  async function loadDimensions() {
    try {
      const data = await getAllDimensions();
      setDimensions(data);
    } catch (err) {
      console.error('Failed to load dimensions:', err);
    } finally {
      setLoadingDimensions(false);
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
    if (!dataset?.alignedFilePath || loadingPreview) return;

    setLoadingPreview(true);
    try {
      // Force fresh download with cache busting
      const blob = await downloadAlignedDataset(dataset.alignedFilePath, true);
      const text = await blob.text();

      // Parse CSV manually (simple parser for preview)
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length === 0) {
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const rows = lines.slice(1, 6).map(line => {
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

  function handleEditAlignment() {
    if (!dataset?.alignmentMapping) return;
    const alignmentCopy = { ...dataset.alignmentMapping };
    setEditableAlignment(alignmentCopy);
    setOriginalAlignment(alignmentCopy);
    setEditMode(true);
    setValidationError(null);
  }

  function handleCancelEdit() {
    setEditMode(false);
    setEditableAlignment({});
    setOriginalAlignment({});
    setValidationError(null);
  }

  function handleDimensionChange(originalColumn: string, newDimension: string) {
    setEditableAlignment(prev => ({
      ...prev,
      [originalColumn]: newDimension
    }));
    // Clear validation error when user makes changes
    setValidationError(null);
  }

  function validateAlignment(): boolean {
    // Only validate non-empty (mapped) dimensions for duplicates
    const mappedDimensions = Object.values(editableAlignment).filter(d => d && d.trim() !== '');
    const uniqueDimensions = new Set(mappedDimensions);

    if (mappedDimensions.length !== uniqueDimensions.size) {
      setValidationError('Duplicate dimension mappings detected. Each dimension can only be mapped once.');
      return false;
    }

    setValidationError(null);
    return true;
  }

  async function handleSaveAlignment() {
    // Don't save if no changes were made
    if (!hasChanges) {
      setEditMode(false);
      setEditableAlignment({});
      setOriginalAlignment({});
      return;
    }

    // Validate only if changes were made
    if (!validateAlignment()) return;

    setSaving(true);
    try {
      // Step 1: Update alignment mapping in database
      await updateDatasetAlignment(Number(id), editableAlignment);

      // Step 2: Regenerate aligned CSV file with new mapping
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      console.log('=== FRONTEND: Sending alignment mapping ===');
      console.log('Dataset ID:', id);
      console.log('Alignment mapping:', JSON.stringify(editableAlignment, null, 2));
      console.log('Sample keys:', Object.keys(editableAlignment).slice(0, 5));

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/regenerate-aligned-dataset`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dataset_id: Number(id),
            alignment_mapping: editableAlignment,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to regenerate aligned dataset');
      }

      console.log('Aligned dataset regenerated successfully');

      // Step 3: Update local state
      if (dataset) {
        setDataset({
          ...dataset,
          alignmentMapping: editableAlignment
        });
      }

      // Step 4: Wait a moment for storage to propagate, then reload preview
      if (previewData) {
        // Add a small delay to ensure storage has updated
        await new Promise(resolve => setTimeout(resolve, 500));
        // Clear old preview data first to force fresh load
        setPreviewData(null);
        await loadDataPreview();
      }

      setEditMode(false);
      setEditableAlignment({});
      setOriginalAlignment({});
    } catch (err) {
      console.error('Failed to save alignment:', err);
      alert(`Failed to save alignment mapping: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
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

  function handleLinkSuccess() {
    setShowLinkDialog(false);
    loadTreeAssociations();
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

        {/* Data Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <CardTitle>Data Preview</CardTitle>
                <CardDescription>
                  First 5 rows of the aligned dataset
                </CardDescription>
              </div>
              {!loadingPreview && (
                <div className="flex-shrink-0">
                  <Button onClick={loadDataPreview} variant="outline" size="sm">
                    {previewData ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                      </>
                    ) : (
                      'Load Preview'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loadingPreview ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : previewData ? (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      {[...previewData.headers].sort((a, b) => a.localeCompare(b)).map((header, index) => (
                        <th key={index} className="px-4 py-3 text-left font-semibold text-foreground">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {previewData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                        {[...previewData.headers].sort((a, b) => a.localeCompare(b)).map((header, colIndex) => (
                          <td key={colIndex} className="px-4 py-3 text-muted-foreground">
                            {row[header] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="border-t bg-muted/30 px-4 py-2">
                  <p className="text-xs text-muted-foreground">
                    Showing {previewData.rows.length} of {dataset.rows} rows
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Click "Load Preview" to view sample data
              </div>
            )}
          </CardContent>
        </Card>

        {/* Column Alignment Mapping */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Column Alignment Mapping</CardTitle>
                <CardDescription>
                  Map original CSV columns to standard dimensions
                </CardDescription>
              </div>
              {!editMode && dataset?.alignmentMapping && (
                <Button onClick={handleEditAlignment} variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Mapping
                </Button>
              )}
              {editMode && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveAlignment}
                    disabled={saving || !hasChanges}
                    size="sm"
                    title={!hasChanges ? 'No changes to save' : ''}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </>
                    )}
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline" size="sm">
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {validationError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{validationError}</span>
              </div>
            )}

            {loadingDimensions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : alignmentEntries.length > 0 ? (
              <>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Original Column</th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Matched Dimension</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {paginatedEntries.map(([originalColumn, matchedDimension], index) => (
                        <tr key={originalColumn} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                          <td className="px-4 py-3 font-medium text-foreground">
                            {originalColumn}
                          </td>
                          <td className="px-4 py-3">
                            {editMode ? (
                              <Select
                                value={editableAlignment[originalColumn] || ''}
                                onChange={(e) => handleDimensionChange(originalColumn, e.target.value)}
                                options={[
                                  { value: '', label: '(Unmapped)' },
                                  ...dimensions.map(d => ({
                                    value: d.name,
                                    label: `${d.displayName}${d.isCritical ? ' *' : ''}`
                                  }))
                                ]}
                              />
                            ) : (
                              <span className={matchedDimension && matchedDimension.trim() ? 'text-foreground' : 'text-muted-foreground'}>
                                {matchedDimension && matchedDimension.trim() ? (
                                  <>
                                    {dimensions.find(d => d.name === matchedDimension)?.displayName || matchedDimension}
                                    {dimensions.find(d => d.name === matchedDimension)?.isCritical && (
                                      <span className="ml-2 inline-flex items-center rounded-md bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                                        Critical
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  '(Unmapped)'
                                )}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {alignmentPage * ITEMS_PER_PAGE + 1} to {Math.min((alignmentPage + 1) * ITEMS_PER_PAGE, alignmentEntries.length)} of {alignmentEntries.length} columns
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAlignmentPage(p => Math.max(0, p - 1))}
                        disabled={alignmentPage === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAlignmentPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={alignmentPage >= totalPages - 1}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No alignment mapping available
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLinkDialog(true)}
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  Link Existing Tree
                </Button>
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
                className="flex-1 transition-all hover:scale-[1.02] hover:shadow-md"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Raw Data
              </Button>
              <Button
                onClick={() => handleDownload('aligned')}
                disabled={!dataset.alignedFilePath}
                variant="outline"
                className="flex-1 transition-all hover:scale-[1.02] hover:shadow-md"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Aligned Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Link Tree Dialog */}
      {showLinkDialog && (
        <LinkTreeDialog
          datasetId={dataset.id}
          datasetName={dataset.nickname || dataset.fileName || `Dataset #${dataset.id}`}
          existingTreeIds={associations.map(a => a.treeId)}
          onSuccess={handleLinkSuccess}
          onCancel={() => setShowLinkDialog(false)}
        />
      )}
    </div>
  );
}
