import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Plus } from 'lucide-react';

export function EmptyState() {
  const navigate = useNavigate();

  return (
    <Card className="border-dashed border-primary/20 bg-white/80">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner shadow-primary/10">
          <FileText className="h-8 w-8" />
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold tracking-tight">No trees yet</h3>
          <p className="mx-auto max-w-md text-base leading-relaxed text-muted-foreground">
            Shape your first decision journey by importing a FIGS file or generating a brand-new evaluation tree.
          </p>
        </div>
        <Button size="lg" onClick={() => navigate('/generate-tree')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Tree
        </Button>
      </CardContent>
    </Card>
  );
}
