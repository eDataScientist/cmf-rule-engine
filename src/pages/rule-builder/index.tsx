import { useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { FieldPalette } from './components/FieldPalette';
import { LogicCanvas } from './components/LogicCanvas';
import { OperatorsPanel } from './components/OperatorsPanel';
import { useDatasetDimensions } from './hooks/useDatasetDimensions';
import { fullCanvasModeAtom, headerBreadcrumbsAtom, headerActionsAtom } from '@/store/atoms/header';
import { ruleBuilderDatasetIdAtom } from '@/store/atoms/ruleBuilder';
import { SaveRuleSetDialog } from './components/SaveRuleSetDialog';

export default function RuleBuilder() {
  const setFullCanvas = useSetAtom(fullCanvasModeAtom);
  const setBreadcrumbs = useSetAtom(headerBreadcrumbsAtom);
  const setHeaderActions = useSetAtom(headerActionsAtom);
  const [datasetId] = useAtom(ruleBuilderDatasetIdAtom);

  // Fetch dimensions when dataset changes
  useDatasetDimensions(datasetId);

  // Enable full canvas mode and set header
  useEffect(() => {
    setFullCanvas(true);
    setBreadcrumbs([{ label: 'Rule Builder' }]);
    setHeaderActions(<SaveRuleSetDialog />);

    return () => {
      setFullCanvas(false);
      setBreadcrumbs(null);
      setHeaderActions(null);
    };
  }, [setFullCanvas, setBreadcrumbs, setHeaderActions]);

  return (
    <div className="flex h-[calc(100vh-64px)]" style={{ backgroundColor: '#09090b' }}>
      <PanelGroup direction="horizontal" className="flex-1">
        {/* Left Panel: Field Palette */}
        <Panel defaultSize={18} minSize={14} maxSize={25}>
          <FieldPalette />
        </Panel>

        <PanelResizeHandle className="w-[2px] bg-zinc-800 hover:bg-blue-500 transition-colors cursor-col-resize" />

        {/* Center Panel: Logic Canvas */}
        <Panel defaultSize={64} minSize={40}>
          <LogicCanvas />
        </Panel>

        <PanelResizeHandle className="w-[2px] bg-zinc-800 hover:bg-blue-500 transition-colors cursor-col-resize" />

        {/* Right Panel: Operators */}
        <Panel defaultSize={18} minSize={14} maxSize={25}>
          <OperatorsPanel />
        </Panel>
      </PanelGroup>
    </div>
  );
}
