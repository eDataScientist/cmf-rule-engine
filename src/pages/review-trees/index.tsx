import { PageHeader } from '@/components/shared/Layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ReviewTrees() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Review Trees"
        description="View and manage your stored decision trees"
        actions={
          <Button onClick={() => navigate('/generate-tree')}>
            <Plus className="h-4 w-4 mr-2" />
            New Tree
          </Button>
        }
      />
      <div className="grid gap-4">
        <p className="text-muted-foreground">No trees found. Create your first tree to get started.</p>
      </div>
    </div>
  );
}
