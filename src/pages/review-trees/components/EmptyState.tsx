import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Plus } from 'lucide-react';

export function EmptyState() {
  const navigate = useNavigate();

  return (
    <Card className="group border-dashed border-white/15 bg-white/[0.03] text-center transition-all duration-500 hover:border-white/25 hover:bg-white/[0.06] hover:shadow-[0_40px_120px_-60px_rgba(79,70,229,0.55)]">
      <CardContent className="flex flex-col items-center justify-center gap-6 py-16">
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-primary/20 via-sky-400/10 to-primary/25 blur-2xl transition-transform duration-500 group-hover:scale-110" />
          <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-primary via-sky-500/70 to-primary/60 text-primary-foreground shadow-[0_18px_45px_-28px_rgba(59,130,246,0.85)]">
            <FileText className="h-9 w-9" />
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold text-white">No trees found</h3>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
            Create your first decision tree to kickstart intelligent fraud detection analysis for your team.
          </p>
        </div>
        <Button onClick={() => navigate('/generate-tree')} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Create Your First Tree
        </Button>
      </CardContent>
    </Card>
  );
}
