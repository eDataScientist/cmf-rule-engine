import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelGroupHandle } from 'react-resizable-panels';
import { Sidebar } from './components/Sidebar';
import { TopPane } from './components/TopPane';
import { TraceInspector } from './components/TraceInspector';
import { useCsvParser } from './hooks/useCsvParser';
import { useBulkEvaluation } from './hooks/useBulkEvaluation';
import { useRuleBulkEvaluation } from './hooks/useRuleBulkEvaluation';
import { useCsvExport } from './hooks/useCsvExport';
import { useFinancialMetrics } from './hooks/useFinancialMetrics';
import { treesAtom } from '@/store/atoms/trees';
import { fullCanvasModeAtom } from '@/store/atoms/header';
import {
  tableVisualizerTreeIdAtom,
  tableVisualizerPanelSizesAtom,
  tableVisualizerViewModeAtom,
  tableVisualizerSelectedClaimIndexAtom,
  tableVisualizerSearchQueryAtom,
  tableVisualizerFileMetadataAtom,
  tableVisualizerClaimsWithResultsAtom,
  tableVisualizerValidationAtom,
  tableVisualizerAnalysisModeAtom,
  tableVisualizerDatasetIdAtom,
  type ClaimWithResult,
  type AnalysisMode,
} from '@/store/atoms/tableVisualization';
import { useClaimSearch } from './hooks/useClaimSearch';
import { useDebouncedSearch } from './hooks/useDebouncedSearch';
import { getTrees } from '@/lib/db/operations';
import type { ClaimData } from '@/lib/types/claim';
import type { TraceResult } from '@/lib/types/trace';
import type { RuleItem } from '@/lib/types/ruleBuilder';

export default function TableVisualizer() {
  const [trees, setTrees] = useAtom(treesAtom);
  const setFullCanvas = useSetAtom(fullCanvasModeAtom);
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);

  // Persisted state atoms
  const [panelSizes, setPanelSizes] = useAtom(tableVisualizerPanelSizesAtom);
  const [selectedTreeId, setSelectedTreeId] = useAtom(tableVisualizerTreeIdAtom);
  const [claimsWithResults, setClaimsWithResults] = useAtom(tableVisualizerClaimsWithResultsAtom);
  const [validation, setValidation] = useAtom(tableVisualizerValidationAtom);
  const [fileMetadata, setFileMetadata] = useAtom(tableVisualizerFileMetadataAtom);
  const [viewMode, setViewMode] = useAtom(tableVisualizerViewModeAtom);
  const [selectedClaimIndex, setSelectedClaimIndex] = useAtom(tableVisualizerSelectedClaimIndexAtom);
  const [searchQuery, setSearchQuery] = useAtom(tableVisualizerSearchQueryAtom);
  const [analysisMode, setAnalysisMode] = useAtom(tableVisualizerAnalysisModeAtom);
  const [currentDatasetId, setCurrentDatasetId] = useAtom(tableVisualizerDatasetIdAtom);

  // Local-only state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loadedRules, setLoadedRules] = useState<RuleItem[]>([]);

  // Search functionality
  const debouncedSearch = useDebouncedSearch(searchQuery);
  const filteredClaims = useClaimSearch(
    claimsWithResults,
    debouncedSearch,
    validation?.claimNumberColumn || null
  );

  // Hooks for tree evaluation
  const { parse, claims, isLoading: isParsing, error: parseError, clear: clearParse } = useCsvParser();
  const { processor, createProcessor, validateColumns, evaluate: evaluateTrees, isProcessing: isTreeProcessing, error: treeEvalError } = useBulkEvaluation();

  // Hooks for rule evaluation
  const { createExecutor, evaluate: evaluateRules, isProcessing: isRuleProcessing, error: ruleEvalError } = useRuleBulkEvaluation();

  const { exportToCsv, isExporting } = useCsvExport();
  const { financialMetrics, fetchFinancialMetrics, clearMetrics, isLoading: isLoadingMetrics } = useFinancialMetrics();

  const isProcessing = analysisMode === 'trees' ? isTreeProcessing : isRuleProcessing;
  const evalError = analysisMode === 'trees' ? treeEvalError : ruleEvalError;

  // Enable full canvas mode
  useEffect(() => {
    setFullCanvas(true);
    return () => {
      setFullCanvas(false);
    };
  }, [setFullCanvas]);

  // Load trees on mount
  useEffect(() => {
    getTrees().then(setTrees);
  }, [setTrees]);

  // Initialize collapsed state if no claim selected
  useEffect(() => {
    if (selectedClaimIndex === null && panelGroupRef.current) {
      panelGroupRef.current.setLayout([95, 5]);
    }
  }, [selectedClaimIndex]);

  // Re-create processor when tree is selected (tree mode only)
  useEffect(() => {
    if (analysisMode === 'trees' && selectedTreeId && trees.length > 0) {
      const tree = trees.find((t) => t.id === selectedTreeId);
      if (tree) {
        createProcessor(tree.structure);
      }
    }
  }, [analysisMode, selectedTreeId, trees, createProcessor]);

  // When CSV is parsed, validate columns (tree mode)
  useEffect(() => {
    if (analysisMode === 'trees' && claims.length > 0 && processor) {
      const csvColumns = Object.keys(claims[0]);
      const validationResult = validateColumns(csvColumns);
      setValidation(validationResult);
      setClaimsWithResults(claims.map((claim) => ({ claim })));
    }
  }, [analysisMode, claims, processor, validateColumns, setValidation, setClaimsWithResults]);

  // When CSV is parsed in rules mode, set up basic validation
  useEffect(() => {
    if (analysisMode === 'rules' && claims.length > 0) {
      const csvColumns = Object.keys(claims[0]);
      // For rules mode, we just need to track available columns
      setValidation({
        isValid: loadedRules.length > 0,
        missingColumns: [],
        requiredColumns: [],
        availableColumns: csvColumns,
        claimNumberColumn: validation?.claimNumberColumn || null,
      });
      setClaimsWithResults(claims.map((claim) => ({ claim })));
    }
  }, [analysisMode, claims, loadedRules.length, setValidation, setClaimsWithResults, validation?.claimNumberColumn]);

  // Clear ALL data when switching modes
  const handleAnalysisModeChange = useCallback((mode: AnalysisMode) => {
    if (mode !== analysisMode) {
      // Clear everything - file, results, validation, rules
      setSelectedFile(null);
      setCurrentDatasetId(null);
      setFileMetadata(null);
      setClaimsWithResults([]);
      setValidation(null);
      setLoadedRules([]);
      setSelectedClaimIndex(null);
      setSelectedTreeId(null);
      clearParse();
      clearMetrics();
    }
    setAnalysisMode(mode);
  }, [analysisMode, setAnalysisMode, setClaimsWithResults, setSelectedClaimIndex, setFileMetadata, setValidation, setCurrentDatasetId, setSelectedTreeId, clearParse, clearMetrics]);

  // Tree mode handlers
  const handleTreeSelect = (treeId: string) => {
    setSelectedTreeId(treeId);
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setFileMetadata({ name: file.name, size: file.size });
    await parse(file);
  };

  const handleDatasetSelect = async (file: File, _datasetName: string, datasetId: number) => {
    setSelectedFile(file);
    setCurrentDatasetId(datasetId);
    setFileMetadata({ name: file.name, size: file.size });
    clearMetrics();
    await parse(file);
  };

  // Rules mode handler - receives rules along with dataset
  const handleRulesDatasetSelect = async (file: File, _datasetName: string, datasetId: number, rules: RuleItem[]) => {
    setSelectedFile(file);
    setCurrentDatasetId(datasetId);
    setFileMetadata({ name: file.name, size: file.size });
    setLoadedRules(rules);
    createExecutor(rules);
    clearMetrics();
    await parse(file);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setCurrentDatasetId(null);
    setFileMetadata(null);
    setClaimsWithResults([]);
    setValidation(null);
    setLoadedRules([]);
    clearParse();
    clearMetrics();
  };

  const handleClaimNumberChange = (columnName: string) => {
    if (analysisMode === 'trees' && processor) {
      processor.setClaimNumberColumn(columnName);
      const csvColumns = Object.keys(claims[0] || {});
      const validationResult = validateColumns(csvColumns);
      setValidation(validationResult);
    } else {
      // Rules mode - just update the column name in validation
      setValidation(prev => prev ? { ...prev, claimNumberColumn: columnName } : null);
    }
  };

  const handleProcess = async () => {
    if (claims.length === 0) return;

    if (analysisMode === 'trees') {
      // Tree evaluation
      const evalResults = await evaluateTrees(claims);
      const merged = claims.map((claim, idx) => ({
        claim,
        result: evalResults[idx],
      }));
      setClaimsWithResults(merged);

      // Fetch financial metrics if dataset
      if (currentDatasetId && validation?.claimNumberColumn) {
        const predictions: Record<string, 'low' | 'moderate' | 'high'> = {};
        for (let i = 0; i < evalResults.length; i++) {
          const result = evalResults[i];
          if (result) {
            predictions[result.claimNumber] = result.riskLevel;
          }
        }
        fetchFinancialMetrics(currentDatasetId, predictions);
      }
    } else {
      // Rule evaluation
      const ruleResults = await evaluateRules(claims);
      const merged = claims.map((claim, idx) => ({
        claim,
        ruleResult: ruleResults[idx],
      }));
      setClaimsWithResults(merged);
    }
  };

  const handleExport = () => {
    if (evaluatedResults.length > 0) {
      exportToCsv(evaluatedResults);
    }
  };

  const handlePanelResize = (sizes: number[]) => {
    setPanelSizes([sizes[0], sizes[1]]);
  };

  const handleClaimSelect = (claim: ClaimWithResult) => {
    const index = filteredClaims.findIndex(c => c === claim);
    setSelectedClaimIndex(index);

    if (index !== -1 && panelSizes[1] < 40) {
      panelGroupRef.current?.setLayout([50, 50]);
    }
  };

  const handleCollapseTrace = () => {
    panelGroupRef.current?.setLayout([95, 5]);
  };

  // Reset selected claim when search changes
  useEffect(() => {
    setSelectedClaimIndex(null);
  }, [debouncedSearch, setSelectedClaimIndex]);

  // Derived state
  const evaluatedResults = filteredClaims.filter(
    (item): item is { claim: ClaimData; result: TraceResult } => item.result !== undefined
  );
  const processedResults = evaluatedResults.map((item) => item.result);

  // Check for results based on mode
  const hasResults = analysisMode === 'trees'
    ? evaluatedResults.length > 0
    : filteredClaims.some(c => c.ruleResult !== undefined);

  // Extract columns used in rules (for rules mode display)
  const ruleColumns = useMemo(() => {
    if (loadedRules.length === 0) return [];
    const columns = new Set<string>();
    for (const rule of loadedRules) {
      if ('field' in rule && rule.field) {
        columns.add(rule.field);
      }
      if ('conditions' in rule && Array.isArray(rule.conditions)) {
        for (const cond of rule.conditions) {
          if (cond.field) {
            columns.add(cond.field);
          }
        }
      }
    }
    return Array.from(columns);
  }, [loadedRules]);

  const error = parseError || evalError;

  const selectedTree = trees.find((t) => t.id === selectedTreeId);
  const selectedClaim =
    selectedClaimIndex !== null && filteredClaims[selectedClaimIndex]
      ? filteredClaims[selectedClaimIndex]
      : null;

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#09090b' }}>
      {/* Error Display */}
      {error && (
        <div
          className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 p-4 bg-red-950 border border-red-900 rounded-md shadow-lg max-w-2xl"
          style={{ minWidth: '400px' }}
        >
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden w-full">
        <Sidebar
          analysisMode={analysisMode}
          onAnalysisModeChange={handleAnalysisModeChange}
          trees={trees}
          selectedTreeId={selectedTreeId}
          onTreeSelect={handleTreeSelect}
          onDatasetSelect={handleDatasetSelect}
          onCsvUpload={handleFileSelect}
          isParsing={isParsing}
          onRulesDatasetSelect={handleRulesDatasetSelect}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          validation={validation}
          onClaimNumberChange={handleClaimNumberChange}
          onProcess={handleProcess}
          onExport={handleExport}
          isProcessing={isProcessing}
          hasResults={hasResults}
          isExporting={isExporting}
          fileMetadata={fileMetadata}
          onClearFile={handleClearFile}
          selectedFile={selectedFile}
          ruleCount={loadedRules.length}
        />

        <PanelGroup
          ref={panelGroupRef}
          direction="vertical"
          onLayout={handlePanelResize}
          className="flex-1"
        >
          <Panel defaultSize={panelSizes[0]} minSize={30} maxSize={80}>
            <TopPane
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              results={processedResults}
              financialMetrics={financialMetrics}
              isLoadingMetrics={isLoadingMetrics}
              claimsWithResults={filteredClaims}
              requiredColumns={processor?.getRequiredColumns() || []}
              ruleColumns={ruleColumns}
              selectedClaimIndex={selectedClaimIndex}
              onClaimSelect={handleClaimSelect}
              isProcessing={isProcessing}
              totalUnfilteredCount={claimsWithResults.length}
              claimNumberColumn={validation?.claimNumberColumn || null}
              analysisMode={analysisMode}
            />
          </Panel>

          <PanelResizeHandle className="h-[2px] bg-zinc-800 hover:bg-zinc-600 transition-colors cursor-row-resize" />

          <Panel defaultSize={panelSizes[1]} minSize={5} maxSize={70}>
            <TraceInspector
              selectedClaim={selectedClaim}
              treeStructure={selectedTree?.structure || null}
              onCollapse={handleCollapseTrace}
              isCollapsed={panelSizes[1] < 10}
              analysisMode={analysisMode}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
