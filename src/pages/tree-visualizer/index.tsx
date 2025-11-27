import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { Loader2, ArrowLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTreeById } from '@/lib/db/operations';
import { InfiniteCanvas } from '@/components/shared/InfiniteCanvas';
import { treesToReactFlow } from '@/lib/utils/treeToReactFlow';
import {
  headerBreadcrumbsAtom,
  headerActionsAtom,
  fullCanvasModeAtom,
} from '@/store/atoms/header';
import type { Tree } from '@/lib/types/tree';

export default function TreeVisualizer() {
  const { treeId } = useParams<{ treeId: string }>();
  const navigate = useNavigate();
  const [tree, setTree] = useState<Tree | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Set breadcrumbs when tree is loaded
  useEffect(() => {
    if (tree) {
      setBreadcrumbs([
        { label: 'Decision Trees', href: '/review-trees' },
        { label: tree.name },
        { label: 'Visualizer' },
      ]);
    }
  }, [tree, setBreadcrumbs]);

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
          Back to Trees
        </Button>
        <Button
          size="sm"
          onClick={() => navigate('/table-visualizer', { state: { selectedTreeId: treeId } })}
          className="gap-2"
          style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
        >
          <Eye className="h-4 w-4" />
          Visualize Data
        </Button>
      </div>
    );
  }, [setActions, navigate, treeId]);

  // Load tree data
  useEffect(() => {
    if (!treeId) {
      setError('No tree ID provided');
      setIsLoading(false);
      return;
    }

    getTreeById(treeId)
      .then((foundTree) => {
        if (foundTree) {
          setTree(foundTree);
          console.log('Loaded tree:', foundTree);
          console.log('Tree structure:', foundTree.structure);
        } else {
          setError('Tree not found');
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load tree');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [treeId]);

  // Convert tree structure to React Flow format
  const { nodes, edges } = useMemo(() => {
    if (!tree) return { nodes: [], edges: [] };
    const result = treesToReactFlow(tree.structure);
    console.log('Generated nodes:', result.nodes);
    console.log('Generated edges:', result.edges);
    return result;
  }, [tree]);

  if (isLoading) {
    return (
      <div
        className="h-full w-full flex items-center justify-center"
        style={{ backgroundColor: '#1a1a1a' }}
      >
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#a1a1aa' }} />
      </div>
    );
  }

  if (error || !tree) {
    return (
      <div
        className="h-full w-full flex flex-col items-center justify-center gap-4"
        style={{ backgroundColor: '#1a1a1a' }}
      >
        <p style={{ color: '#ef4444' }}>Error: {error || 'Tree not found'}</p>
        <Button variant="outline" onClick={() => navigate('/review-trees')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Trees
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <InfiniteCanvas initialNodes={nodes} initialEdges={edges} />
    </div>
  );
}
