import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { Tree } from '@/lib/types/tree';
import { Network } from 'lucide-react';

interface TreeSelectorProps {
  trees: Tree[];
  selectedTreeId: string | null;
  onSelect: (treeId: string) => void;
}

export function TreeSelector({ trees, selectedTreeId, onSelect }: TreeSelectorProps) {
  if (trees.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Tree</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No trees found. Please create a tree first.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Select Tree
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="tree-select">Decision Tree Model</Label>
          <select
            id="tree-select"
            className="w-full p-2 border rounded-md bg-background"
            value={selectedTreeId || ''}
            onChange={(e) => onSelect(e.target.value)}
          >
            <option value="">-- Select a tree --</option>
            {trees.map((tree) => (
              <option key={tree.id} value={tree.id}>
                {tree.name} ({tree.treeType})
              </option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
