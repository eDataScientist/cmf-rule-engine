import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { TreeGrid } from './components/TreeGrid';
import { TreeTable } from './components/TreeTable';
import { EmptyState } from './components/EmptyState';
import { ViewModeToggle } from './components/ViewModeToggle';
import { SearchInput } from './components/SearchInput';
import { Pagination } from './components/Pagination';
import { useTreeList } from './hooks/useTreeList';
import { useTreeDelete } from './hooks/useTreeDelete';
import { treeViewModeAtom, treeSearchQueryAtom, treeCurrentPageAtom, treePageSizeAtom } from '@/store/atoms/trees';

export default function ReviewTrees() {
  const navigate = useNavigate();
  const { trees, isLoading, error } = useTreeList();
  const { remove, isDeleting } = useTreeDelete();
  const [viewMode, setViewMode] = useAtom(treeViewModeAtom);
  const [searchQuery, setSearchQuery] = useAtom(treeSearchQueryAtom);
  const [currentPage, setCurrentPage] = useAtom(treeCurrentPageAtom);
  const [pageSize] = useAtom(treePageSizeAtom);

  // Filter trees based on search query
  const filteredTrees = useMemo(() => {
    if (!searchQuery.trim()) return trees;

    const query = searchQuery.toLowerCase();
    return trees.filter((tree) =>
      tree.name.toLowerCase().includes(query) ||
      tree.treeType.toLowerCase().includes(query)
    );
  }, [trees, searchQuery]);

  // Paginate filtered trees
  const paginatedTrees = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredTrees.slice(startIndex, endIndex);
  }, [filteredTrees, currentPage, pageSize]);

  // Reset to page 1 when search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, setCurrentPage]);

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
          <div className="flex items-center justify-between gap-4">
            {/* View Toggle */}
            <ViewModeToggle mode={viewMode} onChange={setViewMode} />

            {/* Search & New Tree */}
            <div className="flex items-center gap-3">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search trees..."
              />
              <Button
                onClick={() => navigate('/generate-tree')}
                style={{
                  backgroundColor: 'var(--color-foreground)',
                  color: 'var(--color-background)'
                }}
                className="hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Tree
              </Button>
            </div>
          </div>

          {/* Content Area */}
          {filteredTrees.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 rounded-lg border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-muted)' }}>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                {searchQuery ? `No trees found matching "${searchQuery}"` : 'No trees available'}
              </p>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <TreeGrid
                  trees={paginatedTrees}
                  onDelete={remove}
                  onVisualize={handleVisualize}
                  onViewStructure={handleViewStructure}
                  isDeleting={isDeleting}
                />
              ) : (
                <TreeTable
                  trees={paginatedTrees}
                  onDelete={remove}
                  onVisualize={handleVisualize}
                  onViewStructure={handleViewStructure}
                  isDeleting={isDeleting}
                />
              )}

              {/* Pagination */}
              {filteredTrees.length > pageSize && (
                <Pagination
                  currentPage={currentPage}
                  pageSize={pageSize}
                  totalItems={filteredTrees.length}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
