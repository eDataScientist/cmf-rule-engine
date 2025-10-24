import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Plus } from 'lucide-react';

export function EmptyState() {
  const navigate = useNavigate();

  return (
    <Card className="relative overflow-hidden border-0 bg-white/85 shadow-[0_35px_60px_-50px_rgba(15,23,42,0.85)]">
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-52 w-52 rounded-full bg-sky-200/40 blur-3xl" />
      <CardContent className="relative flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/70 bg-white/80 shadow-lg shadow-slate-200/60">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold tracking-tight text-slate-900">No trees yet</h3>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            Create your first decision tree to explore real-time fraud detection analysis and visualise claim journeys.
          </p>
        </div>
        <Button onClick={() => navigate('/generate-tree')} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Create your first tree
        </Button>
      </CardContent>
    </Card>
  );
}
