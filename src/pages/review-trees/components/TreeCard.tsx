import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Activity, Heart, Calendar, Eye } from 'lucide-react';
import type { Tree, TreeNode } from '@/lib/types/tree';
import { isLeafNode } from '@/lib/types/tree';

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
    <Card className="relative overflow-hidden border-0 bg-white/85 shadow-[0_35px_55px_-45px_rgba(15,23,42,0.8)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_40px_65px_-45px_rgba(15,23,42,0.75)]">
      <div className="pointer-events-none absolute right-[-70px] top-[-70px] h-40 w-40 rounded-full bg-primary/15 blur-2xl" />
      <div className="pointer-events-none absolute bottom-[-80px] left-[-80px] h-44 w-44 rounded-full bg-sky-200/40 blur-3xl" />

      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-xl font-semibold text-slate-900">
              {tree.name}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(tree.createdAt).toLocaleDateString()}
            </div>
          </div>
          <Badge
            variant={tree.treeType === 'motor' ? 'default' : 'secondary'}
            className="flex items-center gap-1"
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

      <CardContent className="relative">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-inner shadow-slate-200/50">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Trees
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{treeCount}</p>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-inner shadow-slate-200/50">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Leaf Nodes
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{totalLeaves}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="relative flex gap-3">
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

function countLeaves(node: TreeNode): number {
  if (isLeafNode(node)) return 1;
  return countLeaves(node.true_branch) + countLeaves(node.false_branch);
}
