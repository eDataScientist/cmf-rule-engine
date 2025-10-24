import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { Loader2, Download } from 'lucide-react';
import { PageHeader } from '@/components/shared/Layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CsvUploader } from './components/CsvUploader';
import { ColumnValidation } from './components/ColumnValidation';
import { ClaimsTable } from './components/ClaimsTable';
import { useCsvParser } from './hooks/useCsvParser';
import { useBulkEvaluation } from './hooks/useBulkEvaluation';
import type { ValidationResult } from './hooks/useBulkEvaluation';
import { useCsvExport } from './hooks/useCsvExport';
import { treesAtom } from '@/store/atoms/trees';
import { getTrees } from '@/lib/db/operations';
import type { ClaimData } from '@/lib/types/claim';
import type { TraceResult } from '@/lib/types/trace';

interface ClaimWithResult {
  claim: ClaimData;
  result?: TraceResult;
}

export default function TableVisualizer() {
  const [trees, setTrees] = useAtom(treesAtom);
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

  const handleClearFile = () => {
    setSelectedFile(null);
    setClaimsWithResults([]);
    setValidation(null);
    clearParse();
    setActiveTab('setup');
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

    // Auto-navigate to results tab
    setActiveTab('results');
  };

  const handleExport = () => {
    const dataToExport = claimsWithResults.filter((item) => item.result !== undefined) as {
      claim: ClaimData;
      result: TraceResult;
    }[];

    if (dataToExport.length > 0) {
      exportToCsv(dataToExport);
    }
  };

  const hasResults = claimsWithResults.some((item) => item.result !== undefined);
  const error = parseError || evalError;
  const canValidate = selectedTreeId && claims.length > 0;
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
                    className="w-full rounded-full border border-white/60 bg-white/80 px-4 py-3 text-sm shadow-inner shadow-white/40 transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                <CardTitle>2. Upload CSV File</CardTitle>
              </CardHeader>
              <CardContent>
                <CsvUploader
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                  onClear={handleClearFile}
                  isProcessing={isParsing}
                />
                {isParsing && (
                  <div className="flex items-center justify-center mt-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
                    <span className="text-sm text-muted-foreground">Parsing CSV...</span>
                  </div>
                )}
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
              isProcessing={isProcessing}
            />
          )}
        </TabsContent>

        {/* Tab 3: Results Table */}
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
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
