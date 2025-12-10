import { useState, useEffect, useRef } from 'react';
import { useAtom, useSetAtom } from 'jotai';
// import { useNavigate } from 'react-router-dom'; // TODO: Phase 4
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelGroupHandle } from 'react-resizable-panels';
import { Sidebar } from './components/Sidebar';
import { TopPane } from './components/TopPane';
import { TraceInspector } from './components/TraceInspector';
import { useCsvParser } from './hooks/useCsvParser';
import { useBulkEvaluation } from './hooks/useBulkEvaluation';
import { useCsvExport } from './hooks/useCsvExport';
import { useFinancialMetrics } from './hooks/useFinancialMetrics';
import { treesAtom } from '@/store/atoms/trees';
import { fullCanvasModeAtom } from '@/store/atoms/header';
import {
  // Navigation atoms - TODO: Phase 4
  // selectedTableTreeIdAtom,
  // selectedTableClaimDataAtom,
  // selectedTableTabAtom,
  // isFromTableVisualizerAtom,
  tableVisualizerTreeIdAtom,
  tableVisualizerPanelSizesAtom,
  tableVisualizerViewModeAtom,
  tableVisualizerSelectedClaimIndexAtom,
  tableVisualizerSearchQueryAtom,
  tableVisualizerFileMetadataAtom,
  tableVisualizerClaimsWithResultsAtom,
  tableVisualizerValidationAtom
} from '@/store/atoms/tableVisualization';
import { useClaimSearch } from './hooks/useClaimSearch';
import { useDebouncedSearch } from './hooks/useDebouncedSearch';
import { getTrees } from '@/lib/db/operations';
import type { ClaimData } from '@/lib/types/claim';
import type { TraceResult } from '@/lib/types/trace';
import type { ClaimWithResult } from '@/store/atoms/tableVisualization';

export default function TableVisualizer() {
  // const navigate = useNavigate(); // TODO: Phase 4 - For row click navigation
  const [trees, setTrees] = useAtom(treesAtom);
  const setFullCanvas = useSetAtom(fullCanvasModeAtom);
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);

  // Navigation atoms (for passing data to review-trees) - TODO: Phase 4
  // const [, setTableTreeId] = useAtom(selectedTableTreeIdAtom);
  // const [, setTableClaimData] = useAtom(selectedTableClaimDataAtom);
  // const [, setTableTab] = useAtom(selectedTableTabAtom);
  // const [, setIsFromTable] = useAtom(isFromTableVisualizerAtom);

  // Persisted state atoms
  const [panelSizes, setPanelSizes] = useAtom(tableVisualizerPanelSizesAtom);
  const [selectedTreeId, setSelectedTreeId] = useAtom(tableVisualizerTreeIdAtom);
  const [claimsWithResults, setClaimsWithResults] = useAtom(tableVisualizerClaimsWithResultsAtom);
  const [validation, setValidation] = useAtom(tableVisualizerValidationAtom);
  const [fileMetadata, setFileMetadata] = useAtom(tableVisualizerFileMetadataAtom);
  const [viewMode, setViewMode] = useAtom(tableVisualizerViewModeAtom);
  const [selectedClaimIndex, setSelectedClaimIndex] = useAtom(tableVisualizerSelectedClaimIndexAtom);
  const [searchQuery, setSearchQuery] = useAtom(tableVisualizerSearchQueryAtom);

  // Local-only state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentDatasetId, setCurrentDatasetId] = useState<number | null>(null);

  // Search functionality
  const debouncedSearch = useDebouncedSearch(searchQuery);
  const filteredClaims = useClaimSearch(
    claimsWithResults,
    debouncedSearch,
    validation?.claimNumberColumn || null
  );

  const { parse, claims, isLoading: isParsing, error: parseError, clear: clearParse } = useCsvParser();
  const { processor, createProcessor, validateColumns, evaluate, isProcessing, error: evalError } = useBulkEvaluation();
  const { exportToCsv, isExporting } = useCsvExport();
  const { financialMetrics, fetchFinancialMetrics, clearMetrics, isLoading: isLoadingMetrics } = useFinancialMetrics();

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

  // Re-create processor when tree is selected OR when page loads with cached tree
  useEffect(() => {
    if (selectedTreeId && trees.length > 0) {
      const tree = trees.find((t) => t.id === selectedTreeId);
      if (tree) {
        createProcessor(tree.structure);
      }
    }
  }, [selectedTreeId, trees, createProcessor]);

  // When CSV is parsed, validate columns
  useEffect(() => {
    if (claims.length > 0 && processor) {
      const csvColumns = Object.keys(claims[0]);
      const validationResult = validateColumns(csvColumns);
      setValidation(validationResult);
      setClaimsWithResults(claims.map((claim) => ({ claim })));
    }
  }, [claims, processor, validateColumns, setValidation, setClaimsWithResults]);

  // Handlers
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
    clearMetrics(); // Clear old metrics when loading new dataset
    await parse(file);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setCurrentDatasetId(null);
    setFileMetadata(null);
    setClaimsWithResults([]);
    setValidation(null);
    clearParse();
    clearMetrics();
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

    // If this is a dataset (has datasetId), fetch financial metrics from edge function
    if (currentDatasetId && validation?.claimNumberColumn) {
      // Build predictions map: claimNumber -> riskLevel
      const predictions: Record<string, 'low' | 'moderate' | 'high'> = {};
      for (let i = 0; i < evalResults.length; i++) {
        const result = evalResults[i];
        if (result) {
          predictions[result.claimNumber] = result.riskLevel;
        }
      }

      // Fetch financial metrics in background (non-blocking)
      fetchFinancialMetrics(currentDatasetId, predictions);
    }
  };

  const handleExport = () => {
    if (evaluatedResults.length > 0) {
      exportToCsv(evaluatedResults);
    }
  };

  // TODO: Phase 4 - Uncomment and wire up to table row clicks
  // const handleRowClick = (claim: ClaimData) => {
  //   if (!selectedTreeId) return;
  //   setTableTreeId(selectedTreeId);
  //   setTableClaimData(claim);
  //   setTableTab('visualization');
  //   setIsFromTable(true);
  //   navigate('/review-trees');
  // };

  const handlePanelResize = (sizes: number[]) => {
    setPanelSizes([sizes[0], sizes[1]]);
  };

  const handleClaimSelect = (claim: ClaimWithResult) => {
    // Find the index of this claim in the filteredClaims array
    const index = filteredClaims.findIndex(c => c === claim);
    setSelectedClaimIndex(index);

    // Expand bottom pane when a claim is selected
    if (index !== -1 && panelSizes[1] < 40) {
      panelGroupRef.current?.setLayout([50, 50]);
    }
  };

  const handleCollapseTrace = () => {
    // Just collapse the pane, don't clear selection
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
  const hasResults = evaluatedResults.length > 0;
  const error = parseError || evalError;

  const selectedTree = trees.find((t) => t.id === selectedTreeId);
  const selectedClaim =
    selectedClaimIndex !== null && filteredClaims[selectedClaimIndex]
      ? filteredClaims[selectedClaimIndex]
      : null;

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#09090b' }}>
      {/* Error Display - Fixed Position */}
      {error && (
        <div
          className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 p-4 bg-red-950 border border-red-900 rounded-md shadow-lg max-w-2xl"
          style={{ minWidth: '400px' }}
        >
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Main Content: Sidebar + Split Panes */}
      <div className="flex flex-1 overflow-hidden w-full">
        {/* Sidebar */}
        <Sidebar
          trees={trees}
          selectedTreeId={selectedTreeId}
          onTreeSelect={handleTreeSelect}
          onDatasetSelect={handleDatasetSelect}
          onCsvUpload={handleFileSelect}
          isParsing={isParsing}
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
        />

        {/* Resizable Panels */}
        <PanelGroup
          ref={panelGroupRef}
          direction="vertical"
          onLayout={handlePanelResize}
          className="flex-1"
        >
          {/* Top Pane */}
          <Panel
            defaultSize={panelSizes[0]}
            minSize={30}
            maxSize={80}
          >
            <TopPane
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              results={processedResults}
              financialMetrics={financialMetrics}
              isLoadingMetrics={isLoadingMetrics}
              claimsWithResults={filteredClaims}
              requiredColumns={processor?.getRequiredColumns() || []}
              selectedClaimIndex={selectedClaimIndex}
              onClaimSelect={handleClaimSelect}
              isProcessing={isProcessing}
              totalUnfilteredCount={claimsWithResults.length}
              claimNumberColumn={validation?.claimNumberColumn || null}
            />
          </Panel>

          {/* Resize Handle */}
          <PanelResizeHandle className="h-[2px] bg-zinc-800 hover:bg-zinc-600 transition-colors cursor-row-resize" />

          {/* Bottom Pane */}
          <Panel
            defaultSize={panelSizes[1]}
            minSize={5}
            maxSize={70}
          >
            <TraceInspector
              selectedClaim={selectedClaim}
              treeStructure={selectedTree?.structure || null}
              onCollapse={handleCollapseTrace}
              isCollapsed={panelSizes[1] < 10}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
