import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TreeVisualizer } from '@/components/shared/TreeVisualizer';
import type { TreeNode } from '@/lib/types/tree';
import { countLeafNodes } from '../utils/validator';

interface PreviewPaneProps {
  trees: { title: string; root: TreeNode }[] | null;
}

export function PreviewPane({ trees }: PreviewPaneProps) {
  if (!trees || trees.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Paste your FIGS tree structure to see a preview
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{trees.length} Trees</Badge>
          <Badge variant="secondary">
            {trees.reduce((sum, tree) => sum + countLeafNodes(tree.root), 0)} Total Leaf Nodes
          </Badge>
        </div>

        <TreeVisualizer trees={trees} />
      </CardContent>
    </Card>
  );
}
