import { useLocation } from 'react-router-dom';
import { Database } from 'lucide-react';
import { PageHeader } from '@/components/shared/Layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { TreeForm } from './components/TreeForm';

interface DatasetContext {
  id: number;
  name: string;
  company: string;
  country: string;
}

export default function GenerateTree() {
  const location = useLocation();
  const datasetContext = (location.state as any)?.fromDataset as DatasetContext | undefined;

  return (
    <div className='flex gap-6 flex-col'>
      <PageHeader
        title="Generate Tree"
        description="Parse and create a new decision tree from FIGS format"
      />
      {datasetContext && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Creating tree for dataset</p>
                <p className="text-sm text-muted-foreground">
                  {datasetContext.name} • {datasetContext.company} • {datasetContext.country}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <TreeForm datasetContext={datasetContext} />
    </div>
  );
}
