import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { Loader2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/Layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CsvUploader } from './components/CsvUploader';
import { DatasetSelector } from './components/DatasetSelector';
import { ColumnValidation } from './components/ColumnValidation';
import { ClaimsTable } from './components/ClaimsTable';
import { AnalyticsOverview } from './components/AnalyticsOverview';
import { useCsvParser } from './hooks/useCsvParser';
import { useBulkEvaluation } from './hooks/useBulkEvaluation';
import type { ValidationResult } from '@/lib/processing/TabularClaimsProcessor';
import { useCsvExport } from './hooks/useCsvExport';
import { treesAtom } from '@/store/atoms/trees';
import { selectedTableTreeIdAtom, selectedTableClaimDataAtom, selectedTableTabAtom, isFromTableVisualizerAtom } from '@/store/atoms/tableVisualization';
import { getTrees } from '@/lib/db/operations';
import type { ClaimData } from '@/lib/types/claim';
import type { TraceResult } from '@/lib/types/trace';

interface ClaimWithResult {
  claim: ClaimData;
  result?: TraceResult;
}

export default function TableVisualizer() {
  const navigate = useNavigate();
  const [trees, setTrees] = useAtom(treesAtom);
  const [, setTableTreeId] = useAtom(selectedTableTreeIdAtom);
  const [, setTableClaimData] = useAtom(selectedTableClaimDataAtom);
  const [, setTableTab] = useAtom(selectedTableTabAtom);
  const [, setIsFromTable] = useAtom(isFromTableVisualizerAtom);

  const [activeTab, setActiveTab] = useState<string>('setup');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);
  const [claimsWithResults, setClaimsWithResults] = useState<ClaimWithResult[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const { parse, claims, isLoading: isParsing, error: parseError, clear: clearParse } = useCsvParser();
  const { processor, createProcessor, validateColumns, evaluate, isProcessing, error: evalError } = useBulkEvaluation();
  const { exportToCsv, isExporting } = useCsvExport();

  // Load trees on mount
  useEffect(() => {
    getTrees().then(setTrees);
  }, [setTrees]);

  // When tree is selected, create processor
  const handleTreeSelect = (treeId: string) => {
    setSelectedTreeId(treeId);
    const tree = trees.find((t) => t.id === treeId);
    if (tree) {
      createProcessor(tree.structure);
    }
  };

  // When CSV is parsed, validate columns
  useEffect(() => {
    if (claims.length > 0 && processor) {
      const csvColumns = Object.keys(claims[0]);
      const validationResult = validateColumns(csvColumns);
      setValidation(validationResult);
      setClaimsWithResults(claims.map((claim) => ({ claim })));

      // Auto-navigate to validation tab
      setActiveTab('validation');
    }
  }, [claims, processor, validateColumns]);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    await parse(file);
  };

  const handleDatasetSelect = async (file: File, _datasetName: string) => {
    setSelectedFile(file);
    await parse(file);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setClaimsWithResults([]);
    setValidation(null);
    clearParse();
    setActiveTab('setup');
  };

  const handleClaimNumberChange = (columnName: string) => {
    if (processor) {
      processor.setClaimNumberColumn(columnName);
      // Re-validate with the new claim number column
      const csvColumns = Object.keys(claims[0] || {});
      const validationResult = validateColumns(csvColumns);
      setValidation(validationResult);
    }
  };

  const handleProcess = async () => {
    if (claims.length === 0) return;

    const evalResults = await evaluate(claims);

    // Merge results with claims
    const merged = claims.map((claim, idx) => ({
      claim,
      result: evalResults[idx],
    }));
    setClaimsWithResults(merged);

    // Auto-navigate to analytics tab to review insights first
    setActiveTab('analytics');
  };

  const handleExport = () => {
    if (evaluatedResults.length > 0) {
      exportToCsv(evaluatedResults);
    }
  };

  const handleRowClick = (claim: ClaimData) => {
    if (!selectedTreeId) return;

    // Set atoms for review-trees to consume
    setTableTreeId(selectedTreeId);
    setTableClaimData(claim);
    setTableTab('visualization');
    setIsFromTable(true);

    // Navigate to review-trees
    navigate('/review-trees');
  };

  const evaluatedResults = claimsWithResults.filter(
    (item): item is { claim: ClaimData; result: TraceResult } => item.result !== undefined
  );
  const processedResults = evaluatedResults.map((item) => item.result);
  const hasResults = evaluatedResults.length > 0;
  const error = parseError || evalError;
  const canValidate = selectedTreeId && claims.length > 0;
  const canShowAnalytics = hasResults;
  const canShowResults = hasResults;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Table Visualizer"
        description="Upload CSV data and batch process multiple claims"
      />

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="validation" disabled={!canValidate}>Validation</TabsTrigger>
          <TabsTrigger value="analytics" disabled={!canShowAnalytics}>Analytics</TabsTrigger>
          <TabsTrigger value="results" disabled={!canShowResults}>Results</TabsTrigger>
        </TabsList>

        {/* Tab 1: Setup - Tree Selection + CSV Upload */}
        <TabsContent value="setup">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Select Decision Tree</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="tree-select">Choose a tree model for evaluation</Label>
                  <select
                    id="tree-select"
                    className="w-full p-2 border rounded-md bg-background"
                    value={selectedTreeId || ''}
                    onChange={(e) => handleTreeSelect(e.target.value)}
                  >
                    <option value="">-- Select a tree --</option>
                    {trees.map((tree) => (
                      <option key={tree.id} value={tree.id}>
                        {tree.name} ({tree.treeType})
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Load Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Option A: Select Existing Dataset */}
                  <div>
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold text-foreground mb-1">
                        Option A: Use Existing Dataset
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Select a previously uploaded dataset from storage
                      </p>
                    </div>
                    <DatasetSelector
                      onDatasetSelect={handleDatasetSelect}
                      isLoading={isParsing}
                    />
                  </div>

                  {/* Separator */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">or</span>
                    </div>
                  </div>

                  {/* Option B: Upload New CSV */}
                  <div>
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold text-foreground mb-1">
                        Option B: Upload New CSV File
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Upload a new CSV file from your computer
                      </p>
                    </div>
                    <CsvUploader
                      onFileSelect={handleFileSelect}
                      selectedFile={selectedFile}
                      onClear={handleClearFile}
                      isProcessing={isParsing}
                    />
                  </div>

                  {isParsing && (
                    <div className="flex items-center justify-center pt-2">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
                      <span className="text-sm text-muted-foreground">Parsing CSV...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Column Validation */}
        <TabsContent value="validation">
          {validation && (
            <ColumnValidation
              validation={validation}
              onProceed={handleProcess}
              onClaimNumberChange={handleClaimNumberChange}
              isProcessing={isProcessing}
            />
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsOverview results={processedResults} />
        </TabsContent>

        {/* Tab 4: Results Table */}
        <TabsContent value="results">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={handleExport}
                disabled={!hasResults || isExporting}
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Results
              </Button>
            </div>
            <ClaimsTable
              claims={claimsWithResults}
              requiredColumns={processor?.getRequiredColumns()}
              isProcessing={isProcessing}
              onRowClick={handleRowClick}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
