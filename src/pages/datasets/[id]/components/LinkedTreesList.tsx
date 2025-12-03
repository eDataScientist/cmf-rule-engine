import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Link2, Activity, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { TreeAssociation } from '@/lib/db/operations';
import { LinkTreeDialog } from '@/pages/datasets/components/LinkTreeDialog';
import { formatRelativeTime } from '../utils/formatRelativeTime';

interface LinkedTreesListProps {
  associations: TreeAssociation[];
  loading: boolean;
  datasetId: number;
  datasetName: string;
  onLinkSuccess: () => void;
}

export default function LinkedTreesList({
  associations,
  loading,
  datasetId,
  datasetName,
  onLinkSuccess,
}: LinkedTreesListProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const navigate = useNavigate();

  const handleCreateTree = () => {
    navigate('/generate-tree', {
      state: {
        fromDataset: {
          id: datasetId,
          name: datasetName,
        }
      }
    });
  };

  const handleLinkSuccess = () => {
    setShowLinkDialog(false);
    onLinkSuccess();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Linked Decision Trees</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowLinkDialog(true)}>
              <Link2 className="mr-2 h-4 w-4" />
              Link Existing
            </Button>
            <Button size="sm" onClick={handleCreateTree}>
              <Plus className="mr-2 h-4 w-4" />
              Create New
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : associations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              No trees have been evaluated with this dataset yet
            </p>
            <Button variant="outline" onClick={handleCreateTree}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Tree
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {associations.map(assoc => (
              <div key={assoc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/20">
                <div className="flex items-center gap-3">
                  {assoc.treeType === 'motor' ? (
                    <Activity className="h-5 w-5 text-primary" />
                  ) : (
                    <Heart className="h-5 w-5 text-primary" />
                  )}
                  <div>
                    <p className="font-medium">{assoc.treeName}</p>
                    <p className="text-xs text-muted-foreground">
                      Evaluated {formatRelativeTime(assoc.evaluatedAt)}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" asChild>
                  <Link to={`/tree-visualizer/${assoc.treeId}`}>View</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {showLinkDialog && (
        <LinkTreeDialog
          datasetId={datasetId}
          datasetName={datasetName}
          existingTreeIds={associations.map(a => a.treeId)}
          onSuccess={handleLinkSuccess}
          onCancel={() => setShowLinkDialog(false)}
        />
      )}
    </Card>
  );
}
