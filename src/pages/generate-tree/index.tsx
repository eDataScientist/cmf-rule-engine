import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { ArrowLeft, Save, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDatasets, type DatasetWithStatus } from '@/lib/db/operations';
import { TreeInput } from './components/TreeInput';
import { PreviewPane } from './components/PreviewPane';
import { LeftPanel } from './components/LeftPanel';
import { SaveDialog } from './components/SaveDialog';
import { useTreeParser } from './hooks/useTreeParser';
import { useTreeSave } from './hooks/useTreeSave';
import { validateTreeStructure } from './utils/validator';
import {
  detectBooleanCandidates,
  applyBooleanDecisions,
} from './utils/booleanFeatures';
import type { TreeType } from '@/lib/types/tree';
import {
  headerBreadcrumbsAtom,
  headerActionsAtom,
  fullCanvasModeAtom,
} from '@/store/atoms/header';

interface DatasetContext {
  id: number;
  name: string;
  company: string;
  country: string;
}

const SAMPLE_TREE = `veh_brand_TOYOTA <= 0.500 (Tree #0 root)
\tveh_brand_HYUNDAI <= 0.500 (split)
\t\tveh_brand_KIA <= 0.500 (split)
\t\t\tVal: 0.312 (leaf)
\t\t\tVal: 0.223 (leaf)
\t\tVal: 0.152 (leaf)
\tVal: 0.101 (leaf)

\t+
approved_claim_amount <= 13376.425 (Tree #1 root)
\tdays_between_intm_loss <= 204.500 (split)
\t\tvalue_class_ordinal <= 4.500 (split)
\t\t\tVal: -0.025 (leaf)
\t\t\tVal: 0.041 (leaf)
\t\tVal: 0.169 (leaf)
\tapproved_claim_amount <= 25028.750 (split)
\t\tVal: 0.155 (leaf)
\t\tVal: 0.367 (leaf)

\t+
value_class_ordinal <= 0.000 (Tree #2 root)
\tVal: 0.126 (leaf)
\tVal: -0.007 (leaf)`;

export default function GenerateTree() {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationDataset = (location.state as any)?.fromDataset as DatasetContext | undefined;

  // State
  const [datasets, setDatasets] = useState<DatasetWithStatus[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(navigationDataset?.id ?? null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [treeType, setTreeType] = useState<TreeType>('motor');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Hooks
  const { parsed, error, isValid, parse } = useTreeParser();
  const { save, isSaving, error: saveError } = useTreeSave();

  // Boolean feature detection
  const [booleanCandidates, setBooleanCandidates] = useState<any[]>([]);
  const [booleanDecisions, setBooleanDecisions] = useState<Record<string, boolean>>({});

  // Header atoms
  const setBreadcrumbs = useSetAtom(headerBreadcrumbsAtom);
  const setActions = useSetAtom(headerActionsAtom);
  const setFullCanvas = useSetAtom(fullCanvasModeAtom);

  // Enable full canvas mode
  useEffect(() => {
    setFullCanvas(true);
    return () => {
      setFullCanvas(false);
      setBreadcrumbs(null);
      setActions(null);
    };
  }, [setFullCanvas, setBreadcrumbs, setActions]);

  // Set breadcrumbs
  useEffect(() => {
    setBreadcrumbs([
      { label: 'Decision Trees', href: '/review-trees' },
      { label: 'Generate Tree' },
    ]);
  }, [setBreadcrumbs]);

  // Load datasets
  useEffect(() => {
    loadDatasets();
  }, []);

  // Parse input with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => parse(input), 500);
    return () => clearTimeout(timeoutId);
  }, [input, parse]);

  // Detect boolean candidates
  useEffect(() => {
    if (!parsed) {
      setBooleanCandidates([]);
      setBooleanDecisions({});
      return;
    }

    const detected = detectBooleanCandidates(parsed);
    setBooleanCandidates(detected);
    setBooleanDecisions((prev) => {
      const next: Record<string, boolean> = {};
      detected.forEach((candidate: any) => {
        next[candidate.key] = prev[candidate.key] ?? true;
      });
      return next;
    });
  }, [parsed]);

  const processedTrees = useMemo(
    () => applyBooleanDecisions(parsed, booleanDecisions),
    [parsed, booleanDecisions]
  );

  const structureToSave = processedTrees ?? parsed;
  const canSave = Boolean(isValid && structureToSave && structureToSave.length > 0);

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

  const handleLoadSample = () => setInput(SAMPLE_TREE);

  const handleSave = async (name: string) => {
    if (!structureToSave) return;

    const structureError = validateTreeStructure(structureToSave);
    if (structureError) {
      alert(structureError);
      return;
    }

    try {
      await save(name, treeType, structureToSave, datasetContext?.id);
      setShowSaveDialog(false);
      navigate('/review-trees');
    } catch {
      // Error handled in hook
    }
  };

  // Set header actions
  useEffect(() => {
    setActions(
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/review-trees')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          size="sm"
          onClick={handleLoadSample}
          variant="outline"
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          Load Sample
        </Button>
        <Button
          size="sm"
          onClick={() => setShowSaveDialog(true)}
          disabled={!canSave}
          className="gap-2"
          style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
        >
          <Save className="h-4 w-4" />
          Save Tree
        </Button>
      </div>
    );
  }, [setActions, navigate, canSave]);

  // Loading state
  if (loading) {
    return (
      <div
        className="h-full w-full flex items-center justify-center"
        style={{ backgroundColor: '#09090b' }}
      >
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#a1a1aa' }} />
      </div>
    );
  }

  return (
    <div className="flex h-full" style={{ backgroundColor: '#09090b' }}>
      {/* Left Panel - Configuration */}
      <LeftPanel
        datasets={datasets}
        selectedDatasetId={selectedDatasetId}
        onDatasetChange={setSelectedDatasetId}
        datasetContext={datasetContext}
        treeType={treeType}
        onTreeTypeChange={setTreeType}
        booleanCandidates={booleanCandidates}
        booleanDecisions={booleanDecisions}
        onBooleanDecisionChange={setBooleanDecisions}
      />

      {/* Right Panel - Input & Preview */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Half - FIGS Input */}
        <div className="h-1/2 border-b" style={{ borderColor: '#27272a' }}>
          <div className="h-full flex flex-col" style={{ backgroundColor: '#18181b' }}>
            <div className="flex-shrink-0 px-4 py-3 border-b" style={{ borderColor: '#27272a' }}>
              <h3 className="text-sm font-medium" style={{ color: '#fafafa' }}>
                FIGS Format Input
              </h3>
            </div>
            <div className="flex-1 overflow-hidden">
              <TreeInput
                value={input}
                onChange={setInput}
                error={error}
                isValid={isValid}
              />
            </div>
          </div>
        </div>

        {/* Bottom Half - Tree Preview */}
        <div className="h-1/2 overflow-auto" style={{ backgroundColor: '#09090b' }}>
          <PreviewPane trees={structureToSave} />
        </div>
      </main>

      {/* Save Dialog */}
      {showSaveDialog && (
        <SaveDialog
          onSave={handleSave}
          onCancel={() => setShowSaveDialog(false)}
          isSaving={isSaving}
          error={saveError}
        />
      )}
    </div>
  );
}
