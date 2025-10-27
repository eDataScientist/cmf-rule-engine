import type { Tree } from '@/lib/types/tree';
import { TreeCard } from './TreeCard';

interface TreeGridProps {
  trees: Tree[];
  onDelete: (id: string) => void;
  onVisualize: (id: string) => void;
  onViewStructure: (id: string) => void;
  isDeleting: boolean;
}

export function TreeGrid({ trees, onDelete, onVisualize, onViewStructure, isDeleting }: TreeGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {trees.map((tree) => (
        <TreeCard
          key={tree.id}
          tree={tree}
          onDelete={onDelete}
          onVisualize={onVisualize}
          onViewStructure={onViewStructure}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
}
