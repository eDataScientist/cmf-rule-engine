import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { Loader2 } from 'lucide-react';
import { headerBreadcrumbsAtom } from '@/store/atoms/header';
import { useDatasetRulesets } from './hooks/useDatasetRulesets';
import { DatasetRuleCard } from './components/DatasetRuleCard';
import { EmptyState } from './components/EmptyState';

export default function RuleManagerPage() {
  const navigate = useNavigate();
  const setBreadcrumbs = useSetAtom(headerBreadcrumbsAtom);
  const { datasets, loading, error } = useDatasetRulesets();

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', href: '/' },
      { label: 'Rules' },
    ]);

    return () => {
      setBreadcrumbs(null);
    };
  }, [setBreadcrumbs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <p className="text-destructive font-medium mb-2">Error loading datasets</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!datasets.length) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rules</h1>
        <p className="text-muted-foreground mt-2">
          Manage rules for each dataset. Each dataset maintains one active ruleset.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {datasets.map((dataset) => (
          <DatasetRuleCard
            key={dataset.id}
            dataset={dataset}
            onEdit={() => navigate(`/rule-builder/${dataset.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
