import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, Plus } from 'lucide-react';

export function EmptyState() {
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col items-center justify-center border-dashed border-zinc-800 bg-zinc-900/50 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800/50">
        <FileText className="h-8 w-8 text-zinc-500" />
      </div>
      <div className="mt-6 space-y-2">
        <h3 className="text-xl font-semibold text-zinc-100">No trees yet</h3>
        <p className="mx-auto max-w-sm text-sm text-zinc-400">
          Create your first decision tree to explore real-time fraud detection analysis.
        </p>
      </div>
      <Button onClick={() => navigate('/generate-tree')} size="lg" className="mt-8">
        <Plus className="h-4 w-4 mr-2" />
        Create your first tree
      </Button>
    </Card>
  );
}
