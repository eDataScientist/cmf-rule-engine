import { Table2 } from 'lucide-react';
import { TracedTreeVisualizer } from '@/pages/visualize-trace/components/TracedTreeVisualizer';
import { ResultsHUD } from '@/pages/visualize-trace/components/ResultsHUD';
import type { TreeNode } from '@/lib/types/tree';
import type { ClaimWithResult } from '@/store/atoms/tableVisualization';

interface TraceInspectorProps {
  selectedClaim: ClaimWithResult | null;
  treeStructure: { title: string; root: TreeNode }[] | null;
}

export function TraceInspector({ selectedClaim, treeStructure }: TraceInspectorProps) {
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
    <div className="flex flex-col h-full" style={{ borderTop: '1px solid #27272a' }}>
      {/* ResultsHUD - Collapsible summary */}
      <ResultsHUD result={selectedClaim.result} isEvaluating={false} />

      {/* Trace Visualization */}
      <div className="flex-1 overflow-auto" style={{ paddingBottom: '80px' }}>
        <TracedTreeVisualizer trees={treeStructure} paths={selectedClaim.result.paths} />
      </div>
    </div>
  );
}
