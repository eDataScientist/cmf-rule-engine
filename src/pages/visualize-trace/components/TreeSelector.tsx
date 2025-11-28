import type { Tree } from '@/lib/types/tree';

interface TreeSelectorProps {
  trees: Tree[];
  selectedTreeId: string | null;
  onSelect: (treeId: string) => void;
}

export function TreeSelector({ trees, selectedTreeId, onSelect }: TreeSelectorProps) {
  return (
    <div className="p-4 border-b" style={{ borderColor: '#27272a' }}>
      <label
        className="text-[10px] font-semibold uppercase tracking-wider block mb-2"
        style={{ color: '#71717a' }}
        htmlFor="tree-select"
      >
        Decision Tree
      </label>
      <select
        id="tree-select"
        className="w-full h-8 px-3 rounded text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600 cursor-pointer"
        style={{
          backgroundColor: '#000000',
          border: '1px solid #3f3f46',
          color: '#fafafa',
        }}
        value={selectedTreeId || ''}
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="">Select a tree...</option>
        {trees.map((tree) => (
          <option key={tree.id} value={tree.id}>
            {tree.name} ({tree.treeType})
          </option>
        ))}
      </select>
      {trees.length === 0 && (
        <p className="text-xs mt-2" style={{ color: '#71717a' }}>
          No trees found. Create a tree first.
        </p>
      )}
    </div>
  );
}
