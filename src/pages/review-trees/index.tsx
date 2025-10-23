import { PageHeader } from '@/components/shared/Layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TreeGrid } from './components/TreeGrid';
import { EmptyState } from './components/EmptyState';
import { useTreeList } from './hooks/useTreeList';
import { useTreeDelete } from './hooks/useTreeDelete';

export default function ReviewTrees() {
  const navigate = useNavigate();
  const { trees, isLoading, error } = useTreeList();
  const { remove, isDeleting } = useTreeDelete();

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
    <div>
      <PageHeader
        title="Review Trees"
        description="View and manage your stored decision trees"
        actions={
          trees.length > 0 && (
            <Button onClick={() => navigate('/generate-tree')}>
              <Plus className="h-4 w-4 mr-2" />
              New Tree
            </Button>
          )
        }
      />

      {trees.length === 0 ? (
        <EmptyState />
      ) : (
        <TreeGrid trees={trees} onDelete={remove} isDeleting={isDeleting} />
      )}
    </div>
  );
}
