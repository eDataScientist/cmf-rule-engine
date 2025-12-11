import { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useSetAtom, useAtomValue } from 'jotai';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Loader2, AlertCircle, Cloud } from 'lucide-react';
import { FieldPalette } from './components/FieldPalette';
import { LogicCanvas } from './components/LogicCanvas';
import { OperatorsPanel } from './components/OperatorsPanel';
import { useDatasetDimensions } from './hooks/useDatasetDimensions';
import { useRuleSetLoad } from './hooks/useRuleSetLoad';
import { useRuleAutoSave } from './hooks/useRuleAutoSave';
import { fullCanvasModeAtom, headerBreadcrumbsAtom, headerActionsAtom } from '@/store/atoms/header';
import { ruleBuilderDatasetIdAtom, ruleCountAtom } from '@/store/atoms/ruleBuilder';

function SaveStatusIndicator({ status }: { status: 'saved' | 'saving' | 'error' }) {
  if (status === 'saving') {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="flex items-center gap-2 text-destructive text-sm">
        <AlertCircle className="h-4 w-4" />
        <span>Save failed</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-muted-foreground text-sm">
      <Cloud className="h-4 w-4" />
      <span>Auto-saved</span>
    </div>
  );
}

export default function RuleBuilder() {
  const { datasetId: datasetIdParam } = useParams<{ datasetId: string }>();
  const setFullCanvas = useSetAtom(fullCanvasModeAtom);
  const setBreadcrumbs = useSetAtom(headerBreadcrumbsAtom);
  const setHeaderActions = useSetAtom(headerActionsAtom);
  const setDatasetId = useSetAtom(ruleBuilderDatasetIdAtom);
  const ruleCount = useAtomValue(ruleCountAtom);

  // Parse datasetId from URL params
  const datasetId = datasetIdParam ? parseInt(datasetIdParam, 10) : null;

  // Set the dataset ID in atom when URL param changes
  useEffect(() => {
    if (datasetId) {
      setDatasetId(datasetId);
    }
  }, [datasetId, setDatasetId]);

  // Load existing ruleset for this dataset
  const { loading: loadingRuleset, error: loadError, hasLoaded } = useRuleSetLoad(datasetId || 0);

  // Auto-save when rules change (pass hasLoaded to prevent saving during initial load)
  const { saveStatus } = useRuleAutoSave(datasetId || 0, hasLoaded);

  // Fetch dimensions when dataset changes
  useDatasetDimensions(datasetId);

  // Enable full canvas mode and set header
  useEffect(() => {
    setFullCanvas(true);
    setBreadcrumbs([
      { label: 'Rules', href: '/rules' },
      { label: 'Rule Builder' },
    ]);
    setHeaderActions(
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {ruleCount} {ruleCount === 1 ? 'rule' : 'rules'}
        </span>
        <SaveStatusIndicator status={saveStatus} />
      </div>
    );

    return () => {
      setFullCanvas(false);
      setBreadcrumbs(null);
      setHeaderActions(null);
    };
  }, [setFullCanvas, setBreadcrumbs, setHeaderActions, saveStatus, ruleCount]);

  // Redirect if no dataset ID
  if (!datasetId) {
    return <Navigate to="/rules" replace />;
  }

  // Show loading state while loading ruleset
  if (loadingRuleset) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]" style={{ backgroundColor: '#09090b' }}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show error state
  if (loadError) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] text-destructive" style={{ backgroundColor: '#09090b' }}>
        <p>Error loading ruleset: {loadError}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full" style={{ backgroundColor: '#09090b' }}>
      <PanelGroup direction="horizontal" className="h-full">
        {/* Left Panel: Field Palette */}
        <Panel defaultSize={18} minSize={14} maxSize={25} className="h-full">
          <div className="h-full">
            <FieldPalette />
          </div>
        </Panel>

        <PanelResizeHandle className="w-[2px] bg-zinc-800 hover:bg-blue-500 transition-colors cursor-col-resize" />

        {/* Center Panel: Logic Canvas */}
        <Panel defaultSize={64} minSize={40} className="h-full">
          <div className="h-full">
            <LogicCanvas />
          </div>
        </Panel>

        <PanelResizeHandle className="w-[2px] bg-zinc-800 hover:bg-blue-500 transition-colors cursor-col-resize" />

        {/* Right Panel: Operators */}
        <Panel defaultSize={18} minSize={14} maxSize={25} className="h-full">
          <div className="h-full">
            <OperatorsPanel />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
