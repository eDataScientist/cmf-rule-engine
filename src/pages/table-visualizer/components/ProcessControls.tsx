import { Play, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { Tree } from '@/lib/types/tree';

interface ProcessControlsProps {
  trees: Tree[];
  selectedTreeId: string | null;
  onTreeSelect: (treeId: string) => void;
  onProcess: () => void;
  onExport: () => void;
  hasData: boolean;
  hasResults: boolean;
  isProcessing: boolean;
}

export function ProcessControls({
  trees,
  selectedTreeId,
  onTreeSelect,
  onProcess,
  onExport,
  hasData,
  hasResults,
  isProcessing,
}: ProcessControlsProps) {
  const canProcess = hasData && selectedTreeId && !isProcessing;
  const canExport = hasResults && !isProcessing;

  return (
    <Card className="p-6">
      <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
        <div className="space-y-2">
          <Label htmlFor="tree-select">Select Decision Tree</Label>
          <select
            id="tree-select"
            className="w-full rounded-md border border-border bg-white p-2 text-slate-900 shadow-sm transition focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
            value={selectedTreeId || ''}
            onChange={(e) => onTreeSelect(e.target.value)}
            disabled={isProcessing || trees.length === 0}
          >
            <option value="" style={{ color: '#0f172a' }}>
              -- Select a tree --
            </option>
            {trees.map((tree) => (
              <option key={tree.id} value={tree.id} style={{ color: '#0f172a' }}>
                {tree.name} ({tree.treeType})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <Button
            onClick={onProcess}
            disabled={!canProcess}
            className="w-full md:w-auto"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Process Claims
              </>
            )}
          </Button>
        </div>

        <div className="flex items-end">
          <Button
            onClick={onExport}
            disabled={!canExport}
            variant="outline"
            className="w-full md:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </Button>
        </div>
      </div>
    </Card>
  );
}
