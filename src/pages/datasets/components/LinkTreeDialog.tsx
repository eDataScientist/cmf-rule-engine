import { useState, useEffect } from 'react';
import { Loader2, Activity, Heart, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getTrees, createTreeAssociation } from '@/lib/db/operations';
import type { Tree } from '@/lib/types/tree';

interface LinkTreeDialogProps {
  datasetId: number;
  datasetName: string;
  existingTreeIds: string[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function LinkTreeDialog({
  datasetId,
  datasetName,
  existingTreeIds,
  onSuccess,
  onCancel
}: LinkTreeDialogProps) {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    loadTrees();
  }, []);

  async function loadTrees() {
    try {
      const allTrees = await getTrees();
      // Filter out trees that are already linked
      const availableTrees = allTrees.filter(tree => !existingTreeIds.includes(tree.id));
      setTrees(availableTrees);
    } catch (err) {
      console.error('Failed to load trees:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLink() {
    if (!selectedTreeId) return;

    setLinking(true);
    try {
      await createTreeAssociation({
        datasetId,
        treeId: selectedTreeId,
        resultsJsonb: null,
        metadata: {
          linkedFrom: 'dataset-detail-page',
          linkedAt: new Date().toISOString(),
        },
      });
      console.log(`Linked tree ${selectedTreeId} to dataset ${datasetId}`);
      onSuccess();
    } catch (err) {
      console.error('Failed to link tree:', err);
      alert('Failed to link tree to dataset');
    } finally {
      setLinking(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <CardHeader>
          <CardTitle>Link Existing Tree</CardTitle>
          <CardDescription>
            Select a tree to associate with {datasetName}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : trees.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No available trees to link. All existing trees are already associated with this dataset.
              </p>
              <Button onClick={onCancel} variant="outline">
                Close
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {trees.map((tree) => (
                <div
                  key={tree.id}
                  onClick={() => setSelectedTreeId(tree.id)}
                  className={`
                    cursor-pointer rounded-lg border p-4 transition-all
                    ${selectedTreeId === tree.id
                      ? 'border-primary bg-primary/5 ring-2 ring-primary'
                      : 'hover:border-primary/50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {tree.treeType === 'motor' ? (
                      <Activity className="h-5 w-5 text-primary" />
                    ) : (
                      <Heart className="h-5 w-5 text-primary" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{tree.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {tree.treeType} • {tree.structure.length} tree{tree.structure.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {trees.length > 0 && (
          <div className="border-t p-4 flex justify-end gap-3">
            <Button onClick={onCancel} variant="outline" disabled={linking}>
              Cancel
            </Button>
            <Button
              onClick={handleLink}
              disabled={!selectedTreeId || linking}
            >
              {linking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Linking...
                </>
              ) : (
                <>
                  <Link2 className="mr-2 h-4 w-4" />
                  Link Tree
                </>
              )}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
