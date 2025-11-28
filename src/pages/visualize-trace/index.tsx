import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { TreeSelector } from './components/TreeSelector';
import { ClaimForm } from './components/ClaimForm';
import { TracedTreeVisualizer } from './components/TracedTreeVisualizer';
import { ResultsHUD } from './components/ResultsHUD';
import { useDebouncedEvaluation } from './hooks/useDebouncedEvaluation';
import { useImageExport } from './hooks/useImageExport';
import { extractFeatures } from './utils/extractFeatures';
import { getTrees } from '@/lib/db/operations';
import type { ClaimData } from '@/lib/types/claim';
import type { Tree } from '@/lib/types/tree';
import {
  headerBreadcrumbsAtom,
  headerActionsAtom,
  fullCanvasModeAtom,
} from '@/store/atoms/header';

export default function VisualizeTrace() {
  const { treeId: urlTreeId } = useParams<{ treeId?: string }>();
  const navigate = useNavigate();

  const [trees, setTrees] = useState<Tree[]>([]);
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(urlTreeId || null);
  const [claim, setClaim] = useState<ClaimData>({});
  const [isLoadingTrees, setIsLoadingTrees] = useState(true);

  const { exportAsImage, isExporting } = useImageExport();

  // Set header state
  const setBreadcrumbs = useSetAtom(headerBreadcrumbsAtom);
  const setActions = useSetAtom(headerActionsAtom);
  const setFullCanvas = useSetAtom(fullCanvasModeAtom);

  // Enable full canvas mode on mount, disable on unmount
  useEffect(() => {
    setFullCanvas(true);
    return () => {
      setFullCanvas(false);
      setBreadcrumbs(null);
      setActions(null);
    };
  }, [setFullCanvas, setBreadcrumbs, setActions]);

  // Load trees
  useEffect(() => {
    getTrees()
      .then((loadedTrees) => {
        setTrees(loadedTrees);
        // If URL has treeId but it's not in the list, clear selection
        if (urlTreeId && !loadedTrees.find((t) => t.id === urlTreeId)) {
          setSelectedTreeId(null);
        }
      })
      .finally(() => setIsLoadingTrees(false));
  }, [urlTreeId]);

  const selectedTree = trees.find((t) => t.id === selectedTreeId);

  // Extract features from selected tree
  const features = useMemo(() => {
    if (!selectedTree) return new Map();
    return extractFeatures(selectedTree.structure);
  }, [selectedTree]);

  // Live debounced evaluation
  const { result, isEvaluating } = useDebouncedEvaluation(
    claim,
    selectedTree?.structure,
    300
  );

  // Set breadcrumbs when tree is selected
  useEffect(() => {
    if (selectedTree) {
      setBreadcrumbs([
        { label: 'Decision Trees', href: '/review-trees' },
        { label: selectedTree.name },
        { label: 'Evaluation' },
      ]);
    } else {
      setBreadcrumbs([
        { label: 'Decision Trees', href: '/review-trees' },
        { label: 'Evaluation Runner' },
      ]);
    }
  }, [selectedTree, setBreadcrumbs]);

  // Set header actions
  useEffect(() => {
    const handleExport = () => {
      if (result) {
        exportAsImage('trace-result', `trace-${result.claimNumber}`);
      }
    };

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
        {result && (
          <Button
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2"
            style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export PNG
          </Button>
        )}
      </div>
    );
  }, [setActions, navigate, result, exportAsImage, isExporting]);

  // Loading state
  if (isLoadingTrees) {
    return (
      <div
        className="h-full w-full flex items-center justify-center"
        style={{ backgroundColor: '#09090b' }}
      >
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#a1a1aa' }} />
      </div>
    );
  }

  // Empty state - no trees
  if (trees.length === 0) {
    return (
      <div
        className="h-full w-full flex flex-col items-center justify-center gap-4"
        style={{ backgroundColor: '#09090b' }}
      >
        <p style={{ color: '#71717a' }}>No trees available. Create a tree first.</p>
        <Button
          onClick={() => navigate('/generate-tree')}
          style={{ backgroundColor: '#fafafa', color: '#09090b' }}
        >
          Create Tree
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full" style={{ backgroundColor: '#09090b' }}>
      {/* Left Panel - Inspector */}
      <aside
        className="w-[360px] flex-shrink-0 border-r flex flex-col overflow-hidden"
        style={{ borderColor: '#27272a', backgroundColor: '#18181b' }}
      >
        {/* Tree Selector */}
        <TreeSelector
          trees={trees}
          selectedTreeId={selectedTreeId}
          onSelect={setSelectedTreeId}
        />

        {/* Claim Form - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {selectedTree ? (
            <ClaimForm claim={claim} onChange={setClaim} features={features} />
          ) : (
            <div className="p-4">
              <p className="text-sm" style={{ color: '#71717a' }}>
                Select a tree to start evaluation.
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Right Panel - Results Canvas */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Results HUD */}
        <ResultsHUD result={result} isEvaluating={isEvaluating} />

        {/* Traced Tree Visualization - Scrollable */}
        <div id="trace-result" className="flex-1 overflow-auto">
          {result ? (
            <TracedTreeVisualizer
              trees={selectedTree!.structure}
              paths={result.paths}
            />
          ) : (
            <div
              className="h-full flex items-center justify-center"
              style={{
                backgroundColor: '#09090b',
                backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            >
              <p className="text-sm" style={{ color: '#71717a' }}>
                {selectedTree
                  ? 'Enter a claim number to see the evaluation trace'
                  : 'Select a tree and enter claim data'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
