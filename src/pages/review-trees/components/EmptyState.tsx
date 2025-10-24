import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Plus } from 'lucide-react';

export function EmptyState() {
  const navigate = useNavigate();

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-gradient-to-br from-sky-200 via-blue-100 to-transparent opacity-70 blur-3xl" aria-hidden />
      <CardContent className="flex flex-col items-center justify-center gap-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/70 bg-white/80 shadow-[0_20px_50px_-25px_rgba(30,64,175,0.45)]">
          <FileText className="h-7 w-7 text-slate-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-slate-900">No decision trees yet</h3>
          <p className="max-w-sm text-sm text-slate-600">
            Start by importing a FIGS tree to unlock claim tracing and table visualisation.
          </p>
        </div>
        <Button onClick={() => navigate('/generate-tree')} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Create your first tree
        </Button>
      </CardContent>
    </Card>
  );
}
