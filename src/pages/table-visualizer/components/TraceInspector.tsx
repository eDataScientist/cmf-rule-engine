import { Table2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TracedTreeVisualizer } from '@/pages/visualize-trace/components/TracedTreeVisualizer';
import { ResultsHUD } from '@/pages/visualize-trace/components/ResultsHUD';
import type { TreeNode } from '@/lib/types/tree';
import type { ClaimWithResult } from '@/store/atoms/tableVisualization';

interface TraceInspectorProps {
  selectedClaim: ClaimWithResult | null;
  treeStructure: { title: string; root: TreeNode }[] | null;
  onCollapse: () => void;
  isCollapsed: boolean;
}

export function TraceInspector({ selectedClaim, treeStructure, onCollapse, isCollapsed }: TraceInspectorProps) {
  // Empty state: No tree selected
  if (!treeStructure) {
    return (
      <div
        className="h-full flex items-center justify-center"
        style={{ backgroundColor: '#09090b' }}
      >
        <p className="text-sm text-zinc-500">Select a tree model to enable trace inspection</p>
      </div>
    );
  }

  // Empty state: No claim selected
  if (!selectedClaim?.result) {
    return (
      <div
        className="h-full flex items-center justify-center"
        style={{
          backgroundColor: '#09090b',
          backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        <div className="text-center">
          <Table2 className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-sm text-zinc-500">
            Select a claim from the table above to view its decision trace
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Collapse Button - Always visible */}
      {!isCollapsed && selectedClaim && (
        <div className="flex items-center justify-between border-b px-4 py-2" style={{ borderBottomWidth: '1px', borderColor: '#27272a', backgroundColor: '#18181b' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Trace Inspector
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCollapse}
            className="h-7 px-2 gap-1 text-zinc-400 hover:text-zinc-100"
          >
            <ChevronDown className="h-4 w-4" />
            <span className="text-xs">Collapse</span>
          </Button>
        </div>
      )}

      {/* ResultsHUD - Collapsible summary */}
      {!isCollapsed && <ResultsHUD result={selectedClaim.result} isEvaluating={false} />}

      {/* Trace Visualization */}
      {!isCollapsed && (
        <div className="flex-1 overflow-auto" style={{ paddingBottom: '80px' }}>
          <TracedTreeVisualizer trees={treeStructure} paths={selectedClaim.result.paths} />
        </div>
      )}

      {/* Collapsed State Indicator */}
      {isCollapsed && selectedClaim && (
        <div className="flex items-center justify-center h-full" style={{ backgroundColor: '#09090b' }}>
          <div className="text-center">
            <ChevronDown className="h-8 w-8 text-zinc-700 mx-auto mb-2 animate-bounce" />
            <p className="text-xs text-zinc-500">Drag up to view trace</p>
          </div>
        </div>
      )}
    </div>
  );
}
