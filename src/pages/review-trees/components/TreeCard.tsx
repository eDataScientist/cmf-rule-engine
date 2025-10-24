import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Activity, Heart, Calendar, Eye } from 'lucide-react';
import type { Tree, TreeNode } from '@/lib/types/tree';

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
    <Card className="overflow-hidden border border-white/60 bg-white/80">
      <CardHeader className="relative pb-4">
        <div className="absolute right-6 top-6 h-16 w-16 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-xl font-semibold text-[#2a3160]">{tree.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(tree.createdAt).toLocaleDateString()}
            </div>
          </div>
          <Badge
            variant={tree.treeType === 'motor' ? 'default' : 'secondary'}
            className="flex items-center gap-1 shadow-md shadow-primary/10"
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

      <CardContent className="space-y-4 pt-0">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/60 bg-white/70 p-4 text-center shadow-inner shadow-white/40">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Trees</p>
            <p className="mt-2 text-3xl font-semibold text-[#27335b]">{treeCount}</p>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/70 p-4 text-center shadow-inner shadow-white/40">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Leaf Nodes</p>
            <p className="mt-2 text-3xl font-semibold text-[#27335b]">{totalLeaves}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-2">
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
  if ('value' in node) return 1;
  return countLeaves(node.true_branch) + countLeaves(node.false_branch);
}
