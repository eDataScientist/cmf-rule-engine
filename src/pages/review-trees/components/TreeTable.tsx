import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Activity, Heart } from 'lucide-react';
import { TreeStatusDot } from './TreeStatusDot';
import { TreeActionsMenu } from './TreeActionsMenu';
import type { Tree, TreeNode } from '@/lib/types/tree';
import { isLeafNode } from '@/lib/types/tree';

interface TreeTableProps {
  trees: Tree[];
  onDelete: (id: string) => void;
  onVisualize: (id: string) => void;
  onViewStructure: (id: string) => void;
  isDeleting: boolean;
}

function countLeaves(node: TreeNode): number {
  if (isLeafNode(node)) return 1;
  return countLeaves(node.true_branch) + countLeaves(node.false_branch);
}

function countBranches(node: TreeNode): number {
  if (isLeafNode(node)) return 0;
  return 1 + countBranches(node.true_branch) + countBranches(node.false_branch);
}

function getTreeStatus(tree: Tree): 'active' | 'inactive' {
  // For now, mark trees as active if created in last 7 days
  const daysSinceCreation = (Date.now() - new Date(tree.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceCreation <= 7 ? 'active' : 'inactive';
}

export function TreeTable({ trees, onDelete, onVisualize, onViewStructure, isDeleting }: TreeTableProps) {
  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
      <Table>
        <TableHeader>
          <TableRow style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-muted)' }}>
            <TableHead style={{ color: 'var(--color-foreground)' }}>Tree Name</TableHead>
            <TableHead style={{ color: 'var(--color-foreground)' }}>Type</TableHead>
            <TableHead style={{ color: 'var(--color-foreground)' }}>Complexity</TableHead>
            <TableHead style={{ color: 'var(--color-foreground)' }}>Last Edited</TableHead>
            <TableHead className="w-[100px]" style={{ color: 'var(--color-foreground)' }}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trees.map((tree) => {
            const totalBranches = tree.structure.reduce((sum, t) => sum + countBranches(t.root), 0);
            const totalLeaves = tree.structure.reduce((sum, t) => sum + countLeaves(t.root), 0);
            const status = getTreeStatus(tree);

            return (
              <TableRow
                key={tree.id}
                style={{ borderColor: 'var(--color-border)' }}
                className="hover:bg-zinc-800/50 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <TreeStatusDot status={status} />
                    <span className="font-medium" style={{ color: 'var(--color-foreground)' }}>
                      {tree.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={tree.treeType === 'motor' ? 'default' : 'secondary'}
                    className="flex items-center gap-1 w-fit"
                  >
                    {tree.treeType === 'motor' ? (
                      <Activity className="h-3 w-3" />
                    ) : (
                      <Heart className="h-3 w-3" />
                    )}
                    {tree.treeType.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {totalBranches} branches | {totalLeaves} leaves
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {new Date(tree.createdAt).toLocaleDateString('en-GB')}
                  </span>
                </TableCell>
                <TableCell>
                  <TreeActionsMenu
                    treeId={tree.id}
                    onVisualize={onVisualize}
                    onViewStructure={onViewStructure}
                    onDelete={onDelete}
                    isDeleting={isDeleting}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
