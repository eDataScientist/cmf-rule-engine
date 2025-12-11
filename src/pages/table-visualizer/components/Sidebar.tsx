import { useState } from 'react';
import { CheckCircle2, AlertCircle, Download, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchBar } from './SearchBar';
import { CsvUploader } from './CsvUploader';
import { DatasetSelector } from './DatasetSelector';
import { RulesDatasetSelector } from './RulesDatasetSelector';
import { AnalysisModeSelector } from './AnalysisModeSelector';
import type { Tree } from '@/lib/types/tree';
import type { ValidationResult } from '@/lib/processing/TabularClaimsProcessor';
import type { AnalysisMode } from '@/store/atoms/tableVisualization';
import type { RuleItem } from '@/lib/types/ruleBuilder';

interface SidebarProps {
  // Analysis mode
  analysisMode: AnalysisMode;
  onAnalysisModeChange: (mode: AnalysisMode) => void;

  // Tree selection (for trees mode)
  trees: Tree[];
  selectedTreeId: string | null;
  onTreeSelect: (id: string) => void;

  // Data source (trees mode)
  onDatasetSelect: (file: File, name: string, datasetId: number) => Promise<void>;
  onCsvUpload: (file: File) => void;
  isParsing: boolean;

  // Data source (rules mode)
  onRulesDatasetSelect: (file: File, name: string, datasetId: number, rules: RuleItem[]) => Promise<void>;

  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;

  // Validation
  validation: ValidationResult | null;
  onClaimNumberChange: (column: string) => void;

  // Actions
  onProcess: () => void;
  onExport: () => void;
  isProcessing: boolean;
  hasResults: boolean;
  isExporting: boolean;

  // File management
  fileMetadata: { name: string; size: number } | null;
  onClearFile: () => void;
  selectedFile: File | null;

  // Rules mode specific
  ruleCount?: number;
}

export function Sidebar(props: SidebarProps) {
  const {
    analysisMode,
    onAnalysisModeChange,
    trees,
    selectedTreeId,
    onTreeSelect,
    onDatasetSelect,
    onCsvUpload,
    isParsing,
    onRulesDatasetSelect,
    searchQuery,
    onSearchChange,
    validation,
    onClaimNumberChange,
    onProcess,
    onExport,
    isProcessing,
    hasResults,
    isExporting,
    fileMetadata,
    onClearFile,
    selectedFile,
    ruleCount,
  } = props;

  const [dataSourceTab, setDataSourceTab] = useState('upload');

  return (
    <aside
      className="w-[10%] min-w-[280px] max-w-[400px] flex-shrink-0 border-r flex flex-col overflow-hidden"
      style={{ borderColor: '#27272a', backgroundColor: '#18181b' }}
    >
      {/* Section 0: Analysis Mode Selector */}
      <div className="border-b p-4" style={{ borderBottomWidth: '1px', borderColor: '#27272a' }}>
        <Label className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 block">
          Analysis Mode
        </Label>
        <AnalysisModeSelector
          value={analysisMode}
          onChange={onAnalysisModeChange}
          disabled={isParsing || isProcessing}
        />
      </div>

      {/* Section 1: Tree Selection (Trees mode only) */}
      {analysisMode === 'trees' && (
        <div className="border-b p-4" style={{ borderBottomWidth: '1px', borderColor: '#27272a' }}>
          <Label className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 block">
            Decision Tree Model
          </Label>
          <select
            value={selectedTreeId || ''}
            onChange={(e) => onTreeSelect(e.target.value)}
            className="w-full h-8 bg-black border border-zinc-800 rounded px-3 font-mono text-sm text-zinc-100 focus:outline-none focus:border-zinc-700"
          >
            <option value="">-- Select a tree --</option>
            {trees.map((tree) => (
              <option key={tree.id} value={tree.id}>
                {tree.name} ({tree.treeType})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Rules mode: Show loaded rule count */}
      {analysisMode === 'rules' && ruleCount !== undefined && ruleCount > 0 && (
        <div className="border-b px-4 py-2" style={{ borderBottomWidth: '1px', borderColor: '#27272a' }}>
          <div className="flex items-center gap-2 text-xs text-green-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{ruleCount} rules loaded</span>
          </div>
        </div>
      )}

      {/* Section 2: Data Source */}
      <div className="border-b p-4" style={{ borderBottomWidth: '1px', borderColor: '#27272a' }}>
        <Label className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 block">
          Data Source
        </Label>

        {fileMetadata && fileMetadata.name ? (
          <div className="rounded border p-3 mb-3" style={{ borderColor: '#3f3f46', backgroundColor: '#27272a' }}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-zinc-100 truncate">
                  {fileMetadata.name}
                </p>
                <p className="text-xs text-zinc-500">
                  {(fileMetadata.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFile}
                className="h-6 px-2"
              >
                <span className="text-xs">Clear</span>
              </Button>
            </div>
          </div>
        ) : analysisMode === 'trees' ? (
          // Trees mode: Upload CSV or select raw dataset
          <Tabs value={dataSourceTab} onValueChange={setDataSourceTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-8 bg-zinc-900">
              <TabsTrigger value="upload" className="text-xs">Upload</TabsTrigger>
              <TabsTrigger value="dataset" className="text-xs">Dataset</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-3">
              <CsvUploader
                onFileSelect={onCsvUpload}
                selectedFile={selectedFile}
                onClear={onClearFile}
                isProcessing={isParsing}
              />
            </TabsContent>

            <TabsContent value="dataset" className="mt-3">
              <DatasetSelector
                onDatasetSelect={onDatasetSelect}
                isLoading={isParsing}
              />
            </TabsContent>
          </Tabs>
        ) : (
          // Rules mode: Select dataset with rules (loads aligned data)
          <RulesDatasetSelector
            onDatasetSelect={onRulesDatasetSelect}
            isLoading={isParsing}
          />
        )}
      </div>

      {/* Section 3: Search & Filter */}
      <div className="border-b p-4" style={{ borderBottomWidth: '1px', borderColor: '#27272a' }}>
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search by claim number..."
          claimNumberColumn={validation?.claimNumberColumn || null}
        />
      </div>

      {/* Section 4: Validation Status */}
      <div className="border-b p-4 flex-1 overflow-y-auto" style={{ borderBottomWidth: '1px', borderColor: '#27272a' }}>
        <Label className="text-[10px] uppercase tracking-wider text-zinc-500 mb-3 block">
          Validation Status
        </Label>

        {!validation ? (
          <p className="text-xs text-zinc-500">Upload data to validate columns</p>
        ) : (
          <div className="space-y-3">
            {/* Claim Number Selector */}
            <div>
              <Label className="text-xs text-zinc-400 mb-1 block">Claim Number Column</Label>
              <select
                value={validation.claimNumberColumn || ''}
                onChange={(e) => onClaimNumberChange(e.target.value)}
                className="w-full h-8 bg-black border border-zinc-800 rounded px-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-700"
              >
                <option value="">-- Select column --</option>
                {validation.availableColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Validation Result */}
            <div className="flex items-center gap-2">
              {validation.isValid ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-green-500 font-medium">Ready</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-xs text-red-500 font-medium">Invalid</span>
                </>
              )}
            </div>

            {/* Missing Columns Warning */}
            {validation.missingColumns.length > 0 && (
              <div className="rounded p-2 text-xs" style={{ backgroundColor: '#450a0a', borderColor: '#7f1d1d', border: '1px solid' }}>
                <p className="font-medium text-red-400 mb-1">Missing:</p>
                <p className="text-red-300 font-mono">{validation.missingColumns.join(', ')}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section 5: Actions (Sticky Bottom) */}
      <div className="mt-auto p-4 border-t" style={{ borderTopWidth: '1px', borderColor: '#27272a' }}>
        <Button
          onClick={onProcess}
          disabled={!validation?.isValid || isProcessing || (analysisMode === 'rules' && !ruleCount)}
          className="w-full mb-2 h-9"
          style={{ backgroundColor: validation?.isValid && !isProcessing ? '#fafafa' : undefined, color: validation?.isValid && !isProcessing ? '#09090b' : undefined }}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {analysisMode === 'trees' ? 'Evaluating Trees...' : 'Evaluating Rules...'}
            </>
          ) : (
            analysisMode === 'trees' ? 'Evaluate with Trees' : 'Evaluate with Rules'
          )}
        </Button>

        <Button
          onClick={onExport}
          disabled={!hasResults || isExporting}
          variant="outline"
          className="w-full h-9"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Results
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
