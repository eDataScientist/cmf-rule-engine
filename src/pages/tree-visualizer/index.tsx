import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { PageHeader } from '@/components/shared/Layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getTreeById } from '@/lib/db/operations';
import { TreeDiagram } from './components/TreeDiagram';
import type { Tree } from '@/lib/types/tree';

export default function TreeVisualizer() {
  const { treeId } = useParams<{ treeId: string }>();
  const navigate = useNavigate();
  const [tree, setTree] = useState<Tree | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSubtreeIndex, setCurrentSubtreeIndex] = useState(0);

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

  const handlePrevious = () => {
    setCurrentSubtreeIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    if (tree) {
      setCurrentSubtreeIndex((prev) => Math.min(tree.structure.length - 1, prev + 1));
    }
  };

  const handleVisualize = () => {
    if (treeId) {
      navigate('/review-trees', { state: { selectedTreeId: treeId } });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !tree) {
    return (
      <div className="space-y-6">
        <PageHeader title="Tree Visualizer" description="View decision tree structure" />
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">Error: {error || 'Tree not found'}</p>
        </div>
      </div>
    );
  }

  const currentSubtree = tree.structure[currentSubtreeIndex];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tree Structure Visualizer"
        description={`Viewing: ${tree.name}`}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="default" onClick={handleVisualize}>
              <Eye className="mr-2 h-4 w-4" />
              Visualize
            </Button>
            <Button variant="outline" onClick={() => navigate('/review-trees')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Trees
            </Button>
          </div>
        }
      />

      {/* Carousel Controls */}
      <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/75 backdrop-blur p-6 shadow-xl">
        <div className="pointer-events-none absolute right-10 top-[-40px] h-32 w-32 rounded-full bg-primary/15 blur-2xl" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              {currentSubtreeIndex + 1} of {tree.structure.length}
            </Badge>
            <h3 className="text-lg font-semibold text-slate-900">
              {currentSubtree.title}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentSubtreeIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentSubtreeIndex === tree.structure.length - 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tree Diagram */}
      <TreeDiagram root={currentSubtree.root} title={currentSubtree.title} />
    </div>
  );
}
