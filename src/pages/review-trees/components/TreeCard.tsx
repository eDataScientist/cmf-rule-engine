import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Activity, Heart, Calendar, Eye } from 'lucide-react';
import type { Tree } from '@/lib/types/tree';

interface TreeCardProps {
  tree: Tree;
  onDelete: (id: string) => void;
  onVisualize: (id: string) => void;
  isDeleting: boolean;
}

export function TreeCard({ tree, onDelete, onVisualize, isDeleting }: TreeCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    onDelete(tree.id);
    setShowConfirm(false);
  };

  const treeCount = tree.structure.length;
  const totalLeaves = tree.structure.reduce((sum, t) => {
    return sum + countLeaves(t.root);
  }, 0);

  return (
    <Card className="group overflow-hidden border-white/10 bg-white/[0.03] transition-all duration-500 hover:-translate-y-2 hover:border-white/25 hover:shadow-[0_40px_120px_-50px_rgba(56,189,248,0.6)]">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute -top-24 right-0 h-56 w-56 translate-x-10 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-40 w-40 -translate-x-16 translate-y-16 rounded-full bg-accent/20 blur-3xl" />
      </div>
      <CardHeader className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg font-semibold text-white">
              {tree.name}
            </CardTitle>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground/80">
              <Calendar className="h-3 w-3" />
              {new Date(tree.createdAt).toLocaleDateString()}
            </div>
          </div>
          <Badge
            variant={tree.treeType === 'motor' ? 'default' : 'secondary'}
            className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-[0.7rem] uppercase tracking-[0.2em]"
          >
            {tree.treeType === 'motor' ? (
              <Activity className="h-3 w-3" />
            ) : (
              <Heart className="h-3 w-3" />
            )}
            {tree.treeType === 'motor' ? 'Motor' : 'Medical'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition-all duration-300 group-hover:border-white/20">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/70">Trees</p>
            <p className="mt-2 text-3xl font-semibold text-white">{treeCount}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition-all duration-300 group-hover:border-white/20">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/70">Leaf Nodes</p>
            <p className="mt-2 text-3xl font-semibold text-white">{totalLeaves}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="relative z-10 flex gap-3">
        {!showConfirm ? (
          <>
            <Button
              variant="default"
              size="sm"
              onClick={() => onVisualize(tree.id)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              Visualize
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowConfirm(true)}
              disabled={isDeleting}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1"
            >
              {isDeleting ? 'Deleting...' : 'Confirm'}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}

function countLeaves(node: any): number {
  if ('value' in node) return 1;
  return countLeaves(node.true_branch) + countLeaves(node.false_branch);
}
