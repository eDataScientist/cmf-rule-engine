import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function EmptyState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <FileQuestion className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No datasets found</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        You need to upload datasets before creating rules. Datasets provide the structure for rule definitions.
      </p>
      <Button onClick={() => navigate('/datasets')}>
        Go to Datasets
      </Button>
    </div>
  );
}
