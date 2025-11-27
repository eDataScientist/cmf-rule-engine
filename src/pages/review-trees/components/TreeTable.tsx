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
    <div className="rounded-lg border overflow-visible" style={{ borderColor: 'var(--color-border)' }}>
      <div className="w-full">
        <table className="w-full caption-bottom text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: '#27272a' }}>
              <th className="h-14 px-6 text-left align-middle font-semibold text-xs uppercase tracking-wider first:rounded-tl-lg" style={{ color: 'var(--color-text-secondary)' }}>Tree Name</th>
              <th className="h-14 px-6 text-left align-middle font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Type</th>
              <th className="h-14 px-6 text-left align-middle font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Complexity</th>
              <th className="h-14 px-6 text-left align-middle font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Last Edited</th>
              <th className="h-14 px-6 text-left align-middle font-semibold text-xs uppercase tracking-wider w-[100px] last:rounded-tr-lg" style={{ color: 'var(--color-text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
          {trees.map((tree) => {
            const totalBranches = tree.structure.reduce((sum, t) => sum + countBranches(t.root), 0);
            const totalLeaves = tree.structure.reduce((sum, t) => sum + countLeaves(t.root), 0);
            const status = getTreeStatus(tree);

            return (
              <tr
                key={tree.id}
                style={{ borderColor: 'var(--color-border)' }}
                className="border-b transition-colors hover:bg-zinc-800/50"
              >
                <td className="p-4 align-middle">
                  <div className="flex items-center gap-2">
                    <TreeStatusDot status={status} />
                    <span className="font-medium" style={{ color: 'var(--color-foreground)' }}>
                      {tree.name}
                    </span>
                  </div>
                </td>
                <td className="p-4 align-middle">
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
                </td>
                <td className="p-4 align-middle">
                  <span className="font-mono text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {totalBranches} branches | {totalLeaves} leaves
                  </span>
                </td>
                <td className="p-4 align-middle">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {new Date(tree.createdAt).toLocaleDateString('en-GB')}
                  </span>
                </td>
                <td className="p-4 align-middle">
                  <TreeActionsMenu
                    treeId={tree.id}
                    onVisualize={onVisualize}
                    onViewStructure={onViewStructure}
                    onDelete={onDelete}
                    isDeleting={isDeleting}
                  />
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
