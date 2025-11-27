import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Activity, Heart, Calendar, Eye, Network } from 'lucide-react';
import type { Tree, TreeNode } from '@/lib/types/tree';
import { isLeafNode } from '@/lib/types/tree';

interface TreeCardProps {
  tree: Tree;
  onDelete: (id: string) => void;
  onVisualize: (id: string) => void;
  onViewStructure: (id: string) => void;
  isDeleting: boolean;
}

export function TreeCard({ tree, onDelete, onVisualize, onViewStructure, isDeleting }: TreeCardProps) {
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
    <Card className="relative overflow-hidden border border-zinc-200 bg-white text-zinc-950 shadow-sm transition-all duration-300 hover:shadow-md hover:border-zinc-300">
      <CardHeader className="relative pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-zinc-900">
              {tree.name}
            </CardTitle>
            <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
              <Calendar className="h-3 w-3" />
              {new Date(tree.createdAt).toLocaleDateString()}
            </div>
          </div>
          <Badge
            variant={tree.treeType === 'motor' ? 'default' : 'secondary'}
            className="flex items-center gap-1 font-medium"
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

      <CardContent className="relative py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-md border border-zinc-100 bg-zinc-50/50 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Trees
            </p>
            <p className="mt-1 text-2xl font-bold text-zinc-900 font-mono">{treeCount}</p>
          </div>
          <div className="rounded-md border border-zinc-100 bg-zinc-50/50 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Leaf Nodes
            </p>
            <p className="mt-1 text-2xl font-bold text-zinc-900 font-mono">{totalLeaves}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="relative flex gap-2 pt-2">
        {!showConfirm ? (
          <>
            <Button
              variant="default"
              size="sm"
              onClick={() => onVisualize(tree.id)}
              className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800"
            >
              <Eye className="h-3.5 w-3.5 mr-2" />
              Visualize
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewStructure(tree.id)}
              className="flex-1 border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
            >
              <Network className="h-3.5 w-3.5 mr-2" />
              <span className="hidden xl:inline">Structure</span>
              <span className="xl:hidden">Struct</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowConfirm(true)}
              disabled={isDeleting}
              className="text-zinc-400 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              className="flex-1 border-zinc-200 text-zinc-700"
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
