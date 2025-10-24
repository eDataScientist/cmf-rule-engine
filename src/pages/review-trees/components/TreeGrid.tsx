import type { Tree } from '@/lib/types/tree';
import { TreeCard } from './TreeCard';

interface TreeGridProps {
  trees: Tree[];
  onDelete: (id: string) => void;
  onVisualize: (id: string) => void;
  isDeleting: boolean;
}

export function TreeGrid({ trees, onDelete, onVisualize, isDeleting }: TreeGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {trees.map((tree) => (
        <TreeCard
          key={tree.id}
          tree={tree}
          onDelete={onDelete}
          onVisualize={onVisualize}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
}
