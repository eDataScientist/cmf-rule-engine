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
    <Card className="group relative overflow-hidden border-white/60 bg-white/70 shadow-lg shadow-black/5 backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/30" />
      </div>

      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="font-display text-xl font-semibold text-foreground">
              {tree.name}
            </CardTitle>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              {new Date(tree.createdAt).toLocaleDateString()}
            </div>
          </div>
          <Badge
            variant={tree.treeType === 'motor' ? 'default' : 'secondary'}
            className="flex items-center gap-1 rounded-full px-3 py-1 text-[0.65rem] tracking-[0.3em] uppercase"
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

      <CardContent className="relative grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-inner shadow-black/5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            Trees
          </p>
          <p className="mt-3 font-display text-3xl text-foreground">{treeCount}</p>
        </div>
        <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-inner shadow-black/5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            Leaf Nodes
          </p>
          <p className="mt-3 font-display text-3xl text-foreground">{totalLeaves}</p>
        </div>
      </CardContent>

      <CardFooter className="relative flex flex-col gap-3 p-6 pt-0 sm:flex-row">
        {!showConfirm ? (
          <>
            <Button
              variant="default"
              size="lg"
              onClick={() => onVisualize(tree.id)}
              className="flex-1 rounded-full px-8 text-[0.7rem] tracking-[0.25em] uppercase"
            >
              <Eye className="mr-2 h-4 w-4" />
              Visualize
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowConfirm(true)}
              disabled={isDeleting}
              className="flex-1 rounded-full px-8 text-[0.7rem] tracking-[0.25em] uppercase"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              className="flex-1 rounded-full px-8 text-[0.7rem] tracking-[0.25em] uppercase"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="lg"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 rounded-full px-8 text-[0.7rem] tracking-[0.25em] uppercase"
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
