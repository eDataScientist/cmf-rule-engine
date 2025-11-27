import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { TreeGrid } from './components/TreeGrid';
import { EmptyState } from './components/EmptyState';
import { ViewModeToggle } from './components/ViewModeToggle';
import { SearchInput } from './components/SearchInput';
import { useTreeList } from './hooks/useTreeList';
import { useTreeDelete } from './hooks/useTreeDelete';
import { treeViewModeAtom, treeSearchQueryAtom } from '@/store/atoms/trees';

export default function ReviewTrees() {
  const navigate = useNavigate();
  const { trees, isLoading, error } = useTreeList();
  const { remove, isDeleting } = useTreeDelete();
  const [viewMode, setViewMode] = useAtom(treeViewModeAtom);
  const [searchQuery, setSearchQuery] = useAtom(treeSearchQueryAtom);

  // Filter trees based on search query
  const filteredTrees = useMemo(() => {
    if (!searchQuery.trim()) return trees;

    const query = searchQuery.toLowerCase();
    return trees.filter((tree) =>
      tree.name.toLowerCase().includes(query) ||
      tree.treeType.toLowerCase().includes(query)
    );
  }, [trees, searchQuery]);

  const handleVisualize = (treeId: string) => {
    navigate(`/tree-visualizer/${treeId}`);
  };

  const handleViewStructure = (treeId: string) => {
    navigate(`/tree-visualizer/${treeId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Error loading trees: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-foreground)' }}>Decision Trees</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Manage logic flows and claim evaluations.</p>
      </div>

      {trees.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            {/* View Toggle */}
            <ViewModeToggle mode={viewMode} onChange={setViewMode} />

            {/* New Tree Button */}
            <Button
              onClick={() => navigate('/generate-tree')}
              style={{
                backgroundColor: 'var(--color-foreground)',
                color: 'var(--color-background)'
              }}
              className="hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Tree
            </Button>
          </div>

          {/* Content Area */}
          {viewMode === 'grid' ? (
            <TreeGrid
              trees={trees}
              onDelete={remove}
              onVisualize={handleVisualize}
              onViewStructure={handleViewStructure}
              isDeleting={isDeleting}
            />
          ) : (
            <div className="flex items-center justify-center h-64 rounded-lg border border-zinc-800 bg-zinc-900/50">
              <p className="text-zinc-400">List view coming soon...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
