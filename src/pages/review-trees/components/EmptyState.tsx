import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Plus } from 'lucide-react';

export function EmptyState() {
  const navigate = useNavigate();

  return (
    <Card className="relative overflow-hidden border-white/60 bg-white/80 shadow-xl shadow-black/5 backdrop-blur">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-20%] h-48 w-48 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-[-30%] right-[-10%] h-52 w-52 rounded-full bg-secondary/35 blur-[120px]" />
      </div>
      <CardContent className="relative flex flex-col items-center justify-center gap-6 py-16 text-center">
        <div className="grid h-20 w-20 place-content-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-black/10">
          <FileText className="h-8 w-8" />
        </div>
        <div className="space-y-3">
          <h3 className="font-display text-2xl text-foreground">No trees found</h3>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Create your first decision tree to begin exploring comprehensive claim analysis and dynamic fraud detection insights.
          </p>
        </div>
        <Button
          onClick={() => navigate('/generate-tree')}
          size="lg"
          className="rounded-full px-10 text-[0.75rem] tracking-[0.3em] uppercase"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Your First Tree
        </Button>
      </CardContent>
    </Card>
  );
}
