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
    <Card className="group relative overflow-hidden border-white/70 bg-white/80 shadow-lg shadow-black/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-transparent" />

      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-xl font-semibold tracking-tight">{tree.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(tree.createdAt).toLocaleDateString()}
            </div>
          </div>
          <Badge
            variant={tree.treeType === 'motor' ? 'default' : 'secondary'}
            className="flex items-center gap-2 rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em]"
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

      <CardContent className="pt-0">
        <div className="grid gap-4 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-inner shadow-black/5">
          <div className="flex items-center justify-between text-sm uppercase tracking-[0.3em] text-muted-foreground">
            <span>Trees</span>
            <span>Leaf Nodes</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/60 bg-white px-5 py-4 text-center shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Count</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">{treeCount}</p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white px-5 py-4 text-center shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Total Leaves</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">{totalLeaves}</p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-3 pt-0">
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
