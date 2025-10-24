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
    <Card className="group relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-white/30 opacity-80 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500/80">
              FIGS Tree
            </div>
            <CardTitle className="text-xl font-semibold text-slate-900">{tree.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(tree.createdAt).toLocaleDateString()}
            </div>
          </div>
          <Badge
            variant={tree.treeType === 'motor' ? 'default' : 'secondary'}
            className="flex items-center gap-1 rounded-full border border-white/50 bg-white/70 px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur"
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

      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/60 bg-white/70 p-4 text-slate-600 shadow-inner">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Trees</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{treeCount}</p>
        </div>
        <div className="rounded-2xl border border-white/60 bg-white/70 p-4 text-slate-600 shadow-inner">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Leaf Nodes</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{totalLeaves}</p>
        </div>
      </CardContent>

      <CardFooter className="flex gap-3">
        {!showConfirm ? (
          <>
            <Button
              variant="default"
              size="sm"
              onClick={() => onVisualize(tree.id)}
              className="flex-1"
            >
              <Eye className="mr-2 h-4 w-4" />
              Visualize
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirm(true)}
              disabled={isDeleting}
              className="flex-1"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
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
