import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Plus } from 'lucide-react';

export function EmptyState() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-secondary p-4 mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No trees found</h3>
        <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
          Create your first decision tree to get started with fraud detection analysis
        </p>
        <Button onClick={() => navigate('/generate-tree')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Tree
        </Button>
      </CardContent>
    </Card>
  );
}
